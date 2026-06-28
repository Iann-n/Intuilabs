export function parseFunction(globalFunc: string) {

    let clean = globalFunc.toLowerCase().replace(/\s+/g, '').replace(/cost/g, 'cos(t)').replace(/sint/g, 'sin(t)');
    let rawTerms = clean.match(/[+-]?[^+-]+/g) || [];
    let fractions = [];
    let poles =[];
    
    for (let term of rawTerms) {
      let sign = term.startsWith('-') ? '-' : '+';
      let body = term.replace(/^[+-]/, '');

      let sinM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sin\(([+-]?[\d\.]*)t\)$/);
      if(sinM) {
         let A = parseFloat(sinM[1] || "1"); let w = parseFloat(sinM[2]||"1");
         fractions.push({ sign, num: `${A*w}`, den: `s² + ${w*w}`, rawDen: `s² + ${w*w}` });
         poles.push(`±${w}j`); continue;
      }
      let cosM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cos\(([+-]?[\d\.]*)t\)$/);
      if(cosM) {
         let A = parseFloat(cosM[1] || "1"); let w = parseFloat(cosM[2]||"1");
         fractions.push({ sign, num: `${A===1?'s':A+'s'}`, den: `s² + ${w*w}`, rawDen: `s² + ${w*w}` });
         poles.push(`±${w}j`); continue;
      }
      let sinhM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?sinh\(([+-]?[\d\.]*)t\)$/);
      if(sinhM) {
         let A = parseFloat(sinhM[1] || "1"); let w = parseFloat(sinhM[2]||"1");
         fractions.push({ sign, num: `${A*w}`, den: `s² - ${w*w}`, rawDen: `s² - ${w*w}` });
         poles.push(`±${w}`); continue;
      }
      let coshM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?cosh\(([+-]?[\d\.]*)t\)$/);
      if(coshM) {
         let A = parseFloat(coshM[1] || "1"); let w = parseFloat(coshM[2]||"1");
         fractions.push({ sign, num: `${A===1?'s':A+'s'}`, den: `s² - ${w*w}`, rawDen: `s² - ${w*w}` });
         poles.push(`±${w}`); continue;
      }
      let expM = body.match(/^(?:(\d+(?:\.\d+)?)\*?)?e\^([+-]?[\w\.]*)t$/);
      if (expM) {
         let A = expM[1] || "1"; let aStr = expM[2] || "1"; if (aStr==='+') aStr='1'; if (aStr==='-') aStr='-1';
         let den = aStr.startsWith('-') ? `s + ${aStr.substring(1)}` : `s - ${aStr}`;
         fractions.push({ sign, num: A, den, rawDen: den });
         poles.push(aStr); continue;
      }
      let cM = body.match(/^(\d+(?:\.\d+)?)$/);
      if (cM) {
         fractions.push({ sign, num: cM[1], den: `s`, rawDen: 's' });
         poles.push("0"); continue;
      }
    }
    if(fractions.length > 0 && fractions[0].sign === '+') fractions[0].sign = '';

    return {
        fractions,
        poles: Array.from(new Set(poles))
    };
}