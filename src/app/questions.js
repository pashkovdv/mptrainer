function randomInteger(min, max) {
  // получить случайное число от (min-0.5) до (max+0.5)
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function nextN(histOfTrain, hardness) {
  let best10 = []
  do {
    for (let i=0; i<12; i++) for (let j=0; j<12; j++) {
      let success = histOfTrain[i][j];

      let chance = randomInteger( 0, Math.floor( Math.pow( 1 + hardness/100, success ) ) );
      if (chance != 0 ) continue;

      let delta = i*j
      best10.push({
        x1: i,
        x2: j,
        delta
      })
      best10.sort(function(a, b) {
        return a.delta - b.delta;
      });
      while (best10.length>10) best10.pop();
    }
  } while (best10.length < 10)

  let baseN = best10[randomInteger(0,9)];
  baseN.x1++;
  baseN.x2++;
  return baseN;
}

function addRandomMult(forReturn) {
  
  let answers = forReturn.answers;
  answers.push(forReturn.correctAnswer);
  
  let ans = 0;

  while (answers.length == 1) {
    let dx1 = randomInteger(-1,1)
    let dx2 = randomInteger(-1,1)
    ans = (forReturn.i1 + dx1) * (forReturn.i2 + dx2);
    if (ans > 0 && answers.indexOf(ans) < 0 ) answers.push(ans)
  }

  while (answers.length == 2) {
    ans = answers[0]
    ans = 10*Math.floor(ans/10)
    ans += randomInteger(0,9)
    if (ans > 0 && answers.indexOf(ans) < 0 ) answers.push(ans)
  }

  while (answers.length == 3) {
    ans = answers[0]
    ans = randomInteger(ans-10, ans+10)
    if (ans > 0 && answers.indexOf(ans) < 0 ) answers.push(ans)
  }
}

function addRandomX(forReturn) {
  
  let answers = forReturn.answers;
  answers.push(forReturn.correctAnswer);
  
  let ans = 0;
  while (answers.length < 4) {
    ans = answers[0]
    ans = randomInteger(ans-4, ans+4)
    if (ans > 0 && answers.indexOf(ans) < 0 ) answers.push(ans)
  }

}

function mult0(forReturn) {

  forReturn.x1 = forReturn.i1;
  forReturn.operation = '*';
  forReturn.x2 = forReturn.i2;
  forReturn.x3 = "?";
  forReturn.correctAnswer = forReturn.i1 * forReturn.i2;

  addRandomMult(forReturn)

  return forReturn;
}

function mult1(forReturn) {

  forReturn.x1 = forReturn.i1;
  forReturn.operation = '*';
  forReturn.x2 = "?";
  forReturn.x3 = forReturn.i1 * forReturn.i2;
  forReturn.correctAnswer = forReturn.i2;

  addRandomX(forReturn)

  return forReturn;
}

function mult2(forReturn) {

  forReturn.x1 = "?";
  forReturn.operation = '*';
  forReturn.x2 = forReturn.i2;
  forReturn.x3 = forReturn.i1 * forReturn.i2;
  forReturn.correctAnswer = forReturn.i1;

  addRandomX(forReturn)

  return forReturn;
}

function dev0(forReturn) {

  forReturn.x1 = forReturn.i1 * forReturn.i2;
  forReturn.operation = '/';
  forReturn.x2 = forReturn.i1;
  forReturn.x3 = "?";
  forReturn.correctAnswer = forReturn.i2;

  addRandomX(forReturn)

  return forReturn;
}

function dev1(forReturn) {
  
  forReturn.x1 = forReturn.i1 * forReturn.i2;
  forReturn.operation = '/';
  forReturn.x2 = "?";
  forReturn.x3 = forReturn.i2;
  forReturn.correctAnswer = forReturn.i1;

  addRandomX(forReturn)

  return forReturn;
}

function dev2(forReturn) {
  
  forReturn.x1 = "?";
  forReturn.operation = '/';
  forReturn.x2 = forReturn.i1;
  forReturn.x3 = forReturn.i2;
  forReturn.correctAnswer = forReturn.i1 * forReturn.i2;

  addRandomMult(forReturn)

  return forReturn;
}

export default function question(histOfTrain, hardness) {
  
  let operation;
  let n;

  if ( randomInteger(0, hardness.m + hardness.d) <= hardness.d ) {
    n = nextN(histOfTrain.m, hardness.m);
    operation = '*';
  } else {
    n = nextN(histOfTrain.d, hardness.d);
    operation = '/';
  }
  

  let forReturn = {
    i1: n.x1,
    i2: n.x2,
    x1: 0,
    operation: operation,
    x2: 0,
    x3: 0,
    correctAnswer: 0,
    answers: [],
    answered: [],
    correctFound: false,
    timeEnd: false
  }

  let task = randomInteger(0,2);
  if (operation == '*') {
    switch(task) {
      case 0:
        mult0(forReturn);
        break
      case 1:
        mult1(forReturn);
        break
      case 2:
        mult2(forReturn);
        break
      default:
        break;
    }
  } else {
    switch(task) {
      case 0:
        dev0(forReturn);
        break
      case 1:
        dev1(forReturn);
        break
      case 2:
        dev2(forReturn);
        break
      default:
        break;
    }
  }

  forReturn.answers = forReturn.answers.sort(function(){return Math.random() - 0.5})

  return forReturn;
}