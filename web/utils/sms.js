class RegExpParam extends RegExp {

  constructor(reg, repl) {
    super(reg);
    this.repl = repl;
  }

  [Symbol.replace](str) {
    return RegExp.prototype[Symbol.replace].call(this, str, this.repl);
  }
}

const fillSms = (pattern, values) => {
  const r = RegExp('{{\\s*params.([^\\s]+)\\s*}}');
  while (found = r.exec(pattern)) {
    const param = found[1];
    if (values[param] == undefined) {
      console.error(`Missing param ${param}`);
      return null;
    }
    pattern = pattern.replace(new RegExpParam(`{{\\s*params.${param}\\s*}}`, values[param]));
  }
  return pattern;
};

const isPhoneOk = value => {

  if (value.match(/^(33|0)\d{9}$/)) {
    return true
  }
  return false;
};

module.exports = {fillSms, isPhoneOk}
