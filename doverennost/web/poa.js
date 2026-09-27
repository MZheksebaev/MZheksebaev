// Логика доверенности: нормализация, проверки и сборка PDF поверх пустого шаблона.
// Тот же набор правил, что и в ../generate.py. Работает в браузере (глобальные
// PDFLib и fontkit) и в Node для тестов.
(function (root) {
  "use strict";

  var VALID_DAYS = 10;
  var PAGE_HEIGHT = 853.2;
  var LEFT = 56.664;
  var FONT_SIZE = 12;
  // Базовые линии строк в шаблоне (от верха страницы, как в PyMuPDF).
  var BASELINES = {
    date: 136.22,
    vehicle: 299.57,
    driver: 332.33,
    doc: 364.97,
    route: 397.61,
    valid: 495.79,
  };

  var LOOKALIKE_FROM = "АВЕКМНОРСТУХ";
  var LOOKALIKE_TO = "ABEKMHOPCTYX";

  function normalizePlate(s) {
    var out = "";
    String(s || "").replace(/[\s-]/g, "").toUpperCase().split("").forEach(function (c) {
      var i = LOOKALIKE_FROM.indexOf(c);
      out += i >= 0 ? LOOKALIKE_TO[i] : c;
    });
    return out;
  }

  function titleCase(s) {
    return String(s || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(function (w) {
        return w.charAt(0).toLocaleUpperCase("ru") + w.slice(1).toLocaleLowerCase("ru");
      })
      .join(" ");
  }

  function capitalize(s) {
    s = String(s || "").trim().replace(/\s+/g, " ");
    return s.charAt(0).toLocaleUpperCase("ru") + s.slice(1);
  }

  function iinIsValid(iin) {
    if (!/^\d{12}$/.test(iin)) return false;
    var d = iin.split("").map(Number);
    var sets = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2],
    ];
    for (var k = 0; k < sets.length; k++) {
      var sum = 0;
      for (var i = 0; i < 11; i++) sum += d[i] * sets[k][i];
      var check = sum % 11;
      if (check !== 10) return check === d[11];
    }
    return false;
  }

  function parseDate(s) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(s || "").trim());
    if (!m) return null;
    var dt = new Date(+m[3], +m[2] - 1, +m[1]);
    if (dt.getDate() !== +m[1] || dt.getMonth() !== +m[2] - 1) return null;
    return dt;
  }

  function fmt(dt) {
    var dd = String(dt.getDate()).padStart(2, "0");
    var mm = String(dt.getMonth() + 1).padStart(2, "0");
    return dd + "." + mm + "." + dt.getFullYear();
  }

  function addDays(dt, n) {
    var r = new Date(dt.getTime());
    r.setDate(r.getDate() + n);
    return r;
  }

  // Приводит сырые данные формы к тому виду, в котором они пишутся в доверенность.
  function normalize(raw) {
    return {
      driver: titleCase(raw.driver),
      iin: String(raw.iin || "").replace(/\D/g, ""),
      docNumber: String(raw.docNumber || "").replace(/\s/g, "").toUpperCase(),
      docDate: String(raw.docDate || "").trim(),
      truckBrand: String(raw.truckBrand || "").trim().toUpperCase(),
      truckPlate: normalizePlate(raw.truckPlate),
      trailerPlate: normalizePlate(raw.trailerPlate),
      routeFrom: capitalize(raw.routeFrom),
      routeTo: capitalize(raw.routeTo),
      issueDate: String(raw.issueDate || "").trim(),
    };
  }

  // Возвращает {field: "текст ошибки"} — пустой объект, если всё в порядке.
  function validate(d) {
    var e = {};
    if (d.driver.split(" ").length < 2) e.driver = "Нужны минимум фамилия и имя";
    if (!/^\d{12}$/.test(d.iin)) e.iin = "ИИН — 12 цифр";
    else if (!iinIsValid(d.iin)) e.iin = "Контрольная цифра ИИН не сходится — проверьте цифры";
    if (!/^(\d{9}|N?\d{8})$/.test(d.docNumber))
      e.docNumber = "9 цифр (удостоверение) или 8 цифр (паспорт)";
    if (!parseDate(d.docDate)) e.docDate = "Дата в формате ДД.ММ.ГГГГ";
    if (!d.truckBrand) e.truckBrand = "Укажите марку тягача";
    if (!/^\d{3}[A-Z]{3}\d{2}$/.test(d.truckPlate))
      e.truckPlate = /^[0-9A-Z]{6,9}$/.test(d.truckPlate)
        ? "Необычный формат (ожидается 123ABC45) — проверьте"
        : "Только латинские буквы и цифры";
    if (!/^\d{2}[A-Z]{3}\d{2}$/.test(d.trailerPlate))
      e.trailerPlate = /^[0-9A-Z]{6,9}$/.test(d.trailerPlate)
        ? "Необычный формат (ожидается 12ABC45) — проверьте"
        : "Только латинские буквы и цифры";
    if (!d.routeFrom) e.routeFrom = "Откуда?";
    if (!d.routeTo) e.routeTo = "Куда?";
    if (!parseDate(d.issueDate)) e.issueDate = "Дата в формате ДД.ММ.ГГГГ";
    return e;
  }

  // Предупреждения, которые не мешают выпуску (формат номера — только подсказка).
  function isBlocking(message) {
    return !/проверьте$/.test(message);
  }

  function lines(d) {
    var issue = parseDate(d.issueDate);
    var until = addDays(issue, VALID_DAYS);
    return {
      date: "от " + fmt(issue) + " г.",
      vehicle: "На автотранспорт: " + d.truckBrand + " " + d.truckPlate + "/" + d.trailerPlate,
      driver: "Данные водителя: " + d.driver + ",",
      doc: "ИИН: " + d.iin + " № " + d.docNumber + " Выдан: МВД РК от " + d.docDate,
      route: "По маршруту: " + d.routeFrom + "-" + d.routeTo,
      valid:
        "Срок действия доверенности действителен до " + fmt(until) + " без права передоверия.",
    };
  }

  async function buildPdf(templateBytes, fontBytes, d, libs) {
    var PDFLib = (libs && libs.PDFLib) || root.PDFLib;
    var fontkit = (libs && libs.fontkit) || root.fontkit;
    var doc = await PDFLib.PDFDocument.load(templateBytes);
    doc.registerFontkit(fontkit);
    var font = await doc.embedFont(fontBytes, { subset: false });
    var page = doc.getPage(0);
    var text = lines(d);
    Object.keys(BASELINES).forEach(function (k) {
      page.drawText(text[k], {
        x: LEFT,
        y: PAGE_HEIGHT - BASELINES[k],
        size: FONT_SIZE,
        font: font,
        color: PDFLib.rgb(0, 0, 0),
      });
    });
    return doc.save();
  }

  function fileName(d) {
    var issue = parseDate(d.issueDate);
    var iso = issue.getFullYear() + "-" + fmt(issue).slice(3, 5) + "-" + fmt(issue).slice(0, 2);
    return "Доверенность_" + iso + "_" + d.driver.split(" ")[0] + "_" + d.truckPlate + ".pdf";
  }

  var api = {
    VALID_DAYS: VALID_DAYS,
    normalize: normalize,
    validate: validate,
    isBlocking: isBlocking,
    iinIsValid: iinIsValid,
    lines: lines,
    buildPdf: buildPdf,
    fileName: fileName,
    fmt: fmt,
    parseDate: parseDate,
    addDays: addDays,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.POA = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
