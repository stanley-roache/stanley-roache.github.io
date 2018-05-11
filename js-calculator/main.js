var stack = [],
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
      // add whatever is in temp to stack
      if (temp) stack.push(temp);
      // AC button - clear all calculator contents
      if (val === 'AC') {
        stack = [];
        temp = '';
        currentTotal = 0;
      // CE button, clear last entry
      } else if (val == 'CE') {
        stack.pop();
      // Any operator button
      } else if (operators.hasOwnProperty(val)) {
        if (stack.length == 0) stack.push(currentTotal);
        stack.push(val);
      // = button - evaluate calculation
      } else if (val === '=') {
        currentTotal = evaluate(stack) || currentTotal;
        stack = [];
      // '(' or ')'
      } else if (val == ')' || val == '(') {
        stack.push(val);
      }
      temp = '';
    }
    // display calculation string so far
    $("#display").html((stack.join('') + temp).slice(-20) || currentTotal);
  });
});

// takes array of entries and evaluates
function evaluate(stack) {
  let outerExpression = [],
      innerExpression = [];
  // this while loop checks for brackets and prioritises the contained expression 
  // by passing it to another instance of evaluate
  while (stack.length > 0) {
    if (stack[0] == '(') {
      // get rid of bracket
      let current = stack.shift();
      // iniate variable to track nested brackets if any
      let counter = 1;
      // push everything inside bracket pair to inner expression
      while (counter && current) {
        // get next entry
        current = stack.shift();
        // adjust nested bracket counter
        if (current == '(') counter++;
        else if (current == ')') counter--;
        if (counter) innerExpression.push(current);
      }
      // evaluate braacketed expression separately and push result to outer expression as single entry
      outerExpression.push(evaluate(innerExpression));
    } else {
      // send the element to the outer expression
      outerExpression.push(stack.shift()); 
    }
  }
  // perform operations by order of precedence
  stack = performOperationByType(outerExpression, ['^']);
  stack = performOperationByType(stack, ['x', '/']);
  stack = performOperationByType(stack, ['+','-']);
  return (stack.length == 1) ? '' + stack.pop() : "something's wrong";
}

// this loops over the stack and performs the specified operations
function performOperationByType(stack, types) {
  let newStack = [];
  for (let i = 0; i < stack.length; i++) {
    // check if the next entry matches up with one of the specified operators
    if (types.indexOf(stack[i]) != -1) {
      // pop the last operand off the new stack and do the operation by looking it up in the operators object
      newStack.push(operators[stack[i]](newStack.pop(),stack[i+1]));
      // skip forward once to account for the second operand
      i++;
    // otherwise push the next operand onto the new stack
    } else newStack.push(stack[i]);
  }
  return newStack;
}