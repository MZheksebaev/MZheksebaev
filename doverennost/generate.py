"""Генератор доверенности на водителя по PDF-шаблону.

Шаблон — любая ранее выпущенная доверенность (PDF из Word). Скрипт стирает
изменяемые строки (дата, авто, водитель, ИИН/удостоверение, маршрут, срок)
и печатает на их месте новые данные тем же шрифтом. Фон, водяной знак,
печать и подпись не трогаются.

Пример:
    python generate.py \
        --template templates/coca-cola.pdf \
        --truck-brand VOLVO --truck-plate 099YSZ13 --trailer-plate 99AAT13 \
        --driver "Агалиев Сулейман Ибрагимжанович" \
        --iin 770819302940 --doc-number 040849175 --doc-date 07.11.2016 \
        --from Алматы --to Жетысай
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
FONT_FILE = HERE / "fonts" / "OpenSans-Regular.ttf"
VALID_DAYS = 10  # доверенность всегда выдаётся на 10 дней

# Кириллические буквы, которые выглядят как латинские, — в госномерах РК только латиница.
LOOKALIKES = str.maketrans("АВЕКМНОРСТУХ", "ABEKMHOPCTYX")


@dataclass
class PowerOfAttorney:
    truck_brand: str
    truck_plate: str
    trailer_plate: str
    driver: str
    iin: str
    doc_number: str
    doc_date: str
    route_from: str
    route_to: str
    issue_date: date

    @property
    def valid_until(self) -> date:
        return self.issue_date + timedelta(days=VALID_DAYS)

    @property
    def vehicle(self) -> str:
        # Тягач — марка и номер, прицеп — только номер.
        return f"{self.truck_brand} {self.truck_plate}/{self.trailer_plate}"

    @property
    def route(self) -> str:
        return f"{self.route_from}-{self.route_to}"

    def lines(self) -> dict[str, str]:
        """Начало строки в шаблоне -> новый текст всей строки."""
        return {
            "от ": f"от {self.issue_date:%d.%m.%Y} г.",
            "На автотранспорт:": f"На автотранспорт: {self.vehicle}",
            "Данные водителя:": f"Данные водителя: {self.driver},",
            "ИИН:": (
                f"ИИН: {self.iin} № {self.doc_number} "
                f"Выдан: МВД РК от {self.doc_date}"
            ),
            "По маршруту:": f"По маршруту: {self.route}",
            "Срок действия доверенности": (
                "Срок действия доверенности действителен до "
                f"{self.valid_until:%d.%m.%Y} без права передоверия."
            ),
        }


def iin_is_valid(iin: str) -> bool:
    """Проверка контрольной цифры ИИН Казахстана."""
    if not re.fullmatch(r"\d{12}", iin):
        return False
    digits = [int(c) for c in iin]
    for weights in (range(1, 12), [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2]):
        check = sum(d * w for d, w in zip(digits, weights)) % 11
        if check != 10:
            return check == digits[11]
    return False


def validate(poa: PowerOfAttorney) -> list[str]:
    errors = []
    if not iin_is_valid(poa.iin):
        errors.append(f"ИИН {poa.iin} не проходит проверку контрольной цифры")
    if not re.fullmatch(r"\d{9}", poa.doc_number):
        errors.append(f"Номер удостоверения {poa.doc_number} — ожидается 9 цифр")
    try:
        datetime.strptime(poa.doc_date, "%d.%m.%Y")
    except ValueError:
        errors.append(f"Дата выдачи {poa.doc_date} — ожидается ДД.ММ.ГГГГ")
    for label, plate in (("тягача", poa.truck_plate), ("прицепа", poa.trailer_plate)):
        if not re.fullmatch(r"[0-9A-Z]{6,9}", plate):
            errors.append(f"Госномер {label} {plate} — ожидаются латинские буквы и цифры")
    if len(poa.driver.split()) < 2:
        errors.append(f"ФИО водителя «{poa.driver}» — ожидается минимум фамилия и имя")
    return errors


def find_lines(page: pymupdf.Page, prefixes: list[str]) -> dict[str, dict]:
    """Находит в шаблоне строки, начинающиеся с заданных префиксов."""
    found: dict[str, dict] = {}
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = [s for s in line["spans"] if s["text"].strip()]
            if not spans:
                continue
            text = "".join(s["text"] for s in spans).strip()
            for prefix in prefixes:
                if prefix not in found and text.startswith(prefix):
                    found[prefix] = {
                        "bbox": pymupdf.Rect(line["bbox"]),
                        "origin": spans[0]["origin"],
                        "size": spans[0]["size"],
                        "color": spans[0]["color"],
                    }
    missing = [p for p in prefixes if p not in found]
    if missing:
        raise ValueError(f"В шаблоне не найдены строки: {missing}")
    return found


def render(template: Path, poa: PowerOfAttorney, out: Path) -> Path:
    doc = pymupdf.open(template)
    page = doc[0]
    new_lines = poa.lines()
    targets = find_lines(page, list(new_lines))

    # Стираем только текст; фон, водяной знак и печать остаются.
    for info in targets.values():
        page.add_redact_annot(info["bbox"], fill=False)
    page.apply_redactions(
        images=pymupdf.PDF_REDACT_IMAGE_NONE,
        graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
    )

    for prefix, text in new_lines.items():
        info = targets[prefix]
        page.insert_text(
            info["origin"],
            text,
            fontname="OpenSans",
            fontfile=str(FONT_FILE),
            fontsize=info["size"],
            color=pymupdf.sRGB_to_pdf(info["color"]),
        )

    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out, garbage=3, deflate=True)
    return out


def default_output_name(poa: PowerOfAttorney) -> str:
    surname = poa.driver.split()[0]
    return f"Доверенность_{poa.issue_date:%Y-%m-%d}_{surname}_{poa.truck_plate}.pdf"


def normalize_plate(plate: str) -> str:
    return re.sub(r"[\s-]", "", plate).upper().translate(LOOKALIKES)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--template", required=True, type=Path)
    p.add_argument("--truck-brand", required=True, help="Марка тягача, напр. VOLVO")
    p.add_argument("--truck-plate", required=True, help="Госномер тягача, напр. 099YSZ13")
    p.add_argument("--trailer-plate", required=True, help="Госномер прицепа, напр. 99AAT13")
    p.add_argument("--driver", required=True, help="ФИО водителя")
    p.add_argument("--iin", required=True)
    p.add_argument("--doc-number", required=True, help="№ удостоверения личности")
    p.add_argument("--doc-date", required=True, help="Дата выдачи, ДД.ММ.ГГГГ")
    p.add_argument("--from", dest="route_from", required=True, help="Откуда, напр. Алматы")
    p.add_argument("--to", dest="route_to", required=True, help="Куда, напр. Жетысай")
    p.add_argument("--date", help="Дата доверенности ДД.ММ.ГГГГ (по умолчанию сегодня)")
    p.add_argument("--out", type=Path, help="Куда сохранить PDF")
    p.add_argument("--force", action="store_true", help="Игнорировать ошибки проверки")
    a = p.parse_args()

    issue = datetime.strptime(a.date, "%d.%m.%Y").date() if a.date else date.today()
    poa = PowerOfAttorney(
        truck_brand=a.truck_brand.strip().upper(),
        truck_plate=normalize_plate(a.truck_plate),
        trailer_plate=normalize_plate(a.trailer_plate),
        driver=" ".join(a.driver.split()),
        iin=a.iin.strip(),
        doc_number=a.doc_number.strip(),
        doc_date=a.doc_date.strip(),
        route_from=a.route_from.strip(),
        route_to=a.route_to.strip(),
        issue_date=issue,
    )

    errors = validate(poa)
    if errors and not a.force:
        raise SystemExit("Проверьте данные:\n- " + "\n- ".join(errors))

    out = a.out or HERE / "output" / default_output_name(poa)
    print(render(a.template, poa, out))


if __name__ == "__main__":
    main()
