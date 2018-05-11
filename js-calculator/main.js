var entries = [],
    currentTotal = 0,
    temp = '',
    operators = {
      '^': (a,b) => Math.pow(a,b),
      'x': (a,b) => a*b,
      '/': (a,b) => a/b,
      '+': (a,b) => Number(a)+Number(b),
      '-': (a,b) => a-b,
    }

// When the DOM is loaded
$('document').ready(function() {
  // add as click listener to all buttons
  $("button").click(function() {
    // store button value
    var val = $(this).text();
    // if the button pressed starts or continues a single number
    if (/[0-9.]/.test(val)) {
      if (currentTotal) {
        currentTotal = 0;
        temp = '';
      }
      temp += val;
    // the button pressed is not part of a number
    } else {
      // add whatever is in temp to entries
      if (temp) entries.push(temp);
      // AC button - clear all calculator contents
      if (val === 'AC') {
        entries = [];
        temp = '';
        currentTotal = 0;
      // CE button, clear last entry
      } else if (val == 'CE') {
        entries.pop();
      // Any operator button
      } else if (operators.hasOwnProperty(val)) {
        if (entries.length == 0) entries.push(currentTotal);
        entries.push(val);
      // = button - evaluate calculation
      } else if (val === '=') {
        currentTotal = evaluate(entries) || currentTotal;
        entries = [];
      // '(' or ')'
      } else if (val == ')' || val == '(') {
        entries.push(val);
      }
      temp = '';
    }
    // display calculation string so far
    $("#display").html((entries.join('') + temp).slice(-20) || currentTotal);
  });
});

// takes array of entries and evaluates
function evaluate(entries) {
  entries = dealWithBracketPair(entries);
  // perform operations by order of precedence
  entries = performOperationByType(entries, ['^']);
  entries = performOperationByType(entries, ['x', '/']);
  entries = performOperationByType(entries, ['+','-']);
  return (entries.length == 1) ? '' + entries.pop() : "something's wrong";
}

function dealWithBracketPair(entries) {
  let outerExpression = [],
      innerExpression = [];
  // this while loop checks for brackets and prioritises the contained expression 
  // by passing it to another instance of evaluate
  while (entries.length > 0) {
    if (entries[0] == '(') {
      // get rid of bracket
      let current = entries.shift();
      // iniate variable to track nested brackets if any
      let counter = 1;
      // push everything inside bracket pair to inner expression
      while (counter && current) {
        // get next entry
        current = entries.shift();
        // adjust nested bracket counter
        if (current == '(') counter++;
        else if (current == ')') counter--;
        if (counter) innerExpression.push(current);
      }
      // evaluate braacketed expression separately and push result to outer expression as single entry
      outerExpression.push(evaluate(innerExpression));
    } else {
      // send the element to the outer expression
      outerExpression.push(entries.shift()); 
    }
  }
  return outerExpression;
}

// this loops over the entries and performs the specified operations
function performOperationByType(entries, types) {
  let newentries = [];
  for (let i = 0; i < entries.length; i++) {
    // check if the next entry matches up with one of the specified operators
    if (types.indexOf(entries[i]) != -1) {
      // pop the last operand off the new entries and do the operation by looking it up in the operators object
      newentries.push(operators[entries[i]](newentries.pop(),entries[i+1]));
      // skip forward once to account for the second operand
      i++;
    // otherwise push the next operand onto the new entries
    } else newentries.push(entries[i]);
  }
  return newentries;
}