'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-11-18T17:01:17.194Z',
    '2022-11-19T23:36:17.929Z',
    '2022-11-21T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-06-25T19:49:59.371Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed < 7) return `${daysPassed} DAYS AGO`;
  else {
    /*
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
    */
    return new Intl.DateTimeFormat(currentAccount.locale, options).format(date);
  }
};

const formattedCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedCur(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formattedCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  // Set time to 5 minutes
  let time = 5 * 60;
  //Call the timer every second
  const tick = function () {
    const min = `${Math.floor(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);

    //In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec.padStart(2, 0)}`;

    //When the time is 0, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    //Decrease 1 second
    time--;
  };
  tick(); //we have to write it in a separate function and call it before the set interval
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer1;

//  FAKE ALWAYS LOGGED IN
/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
*/
//Experimentig API
const now2 = new Date();

const options2 = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long', //or numeric
  year: 'numeric', // or 2-digit
  weekday: 'long', // short or narrow
};
//We can specify the hour and the minute as an argument to the datetimeformat method

//Getting the locale string from the browser:
//const locale = navigator.language;

//We call a new Intl, that is the namespace, and for date time format we call the dateTimeFormat method. We need to pass a so-called locale string. And this locale is usually the language and then dash the country.
/*
labelDate.textContent = new Intl.DateTimeFormat(
  currentAccount.locale,
  options2
).format(now2);
*/

//All of this creates a new formatter and then on that formatter we can call dot format. ANthen, we can pass the date that we want to format, and it's now2.

//All the codes in: http://www.lingoes.net/en/translator/langcode.htm

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);

    //Start Timer
    if (timer1) clearInterval(timer1);
    timer1 = startLogOutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
  }

  //Reset timer
  clearInterval(timer1);
  timer1 = startLogOutTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1))
    setTimeout(() => {
      {
        // Add movement
        currentAccount.movements.push(amount);

        //Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());

        // Update UI
        updateUI(currentAccount);
      }
    }, 3 * 1000);
  inputLoanAmount.value = '';

  //Reset timer
  clearInterval(timer1);
  timer1 = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//  ----------------  CONVERTING AND CHECKING NUMBERS

//In JS all numbers are represented internally as floating point numbers. Always as decimals no matter if we actually write them as integers or as decimals.

console.log(23 === 23.0); //true

//We have one data type for all numbers.
//Also, numbers are reprensented internally in a 64 base 2 format. That means that numbers aer always stored in abinary format. They're only compesed of 0 and 1.
//In this binary form, it's very hard to represent some fractions that are very easy to represent in the base 10 system that we are used to.
//Base 10 - 0 to 9
// base 2 - 0 to 1

//There are numbers that are very difficult to represent in base 2. For example the number 0.1
console.log(0.1 + 0.2); //0.30000000000000004

//For example, 3/10 in base 10 would be 0.33333333333333 until the infinity, then it would be impossible to represent. The same thing happen with 1/10 in base 2. So we get basically an infinit fraction and that then results in a weird result like this one.
//Sometimes JS does a truncate behind the scenes, but sometimes it cannot.

//IMPORTANT: be aware that you cannot do like really precise scientific or financial calculations in JS because eventually, you will run into a problem like this.
console.log(0.1 + 0.2 === 0.3); //false

//Convert string to a number
console.log(Number('23')); //23

//Easier way:
console.log(+'23'); //23 (JS will do type coercion)

//Parsing
//On the number object, which is kind of a function but it's also an object in the end. Beacuse every function is also an object. This Number object has some methods to do parsing.
console.log(Number.parseInt('30px')); //30 (inside the parenthesis we specify a string and that string can even include some symbols, and JS will then automatically try to figure out the number that is in the string)
//In order to make this work, the string has to start with a number.
console.log(Number.parseInt('p30')); //NaN

//The parseInt function also accepts a second parameter, which is the so-called regex. The regex is the base of the numeral system that we are using. So here we are simply using base 10 numbers (the default value of the regex is 10)

console.log(Number.parseFloat('   0.2555ii')); //0.2555 (we can have some spaces that won't affect anything)
console.log(Number.parseInt('    0.2555ii')); //0

//These functions are also so-called global functions. So we would not have to call them on Number. So this will also work:
console.log(parseInt('25rem')); //25

//This is the old way to call the function. Now in modern JS it is more encouraged to call these functions actually on the Number object.
//We say that Number here provides something called a namespace for the functions.

//Is not a number:
//We can use this one to basically check if any value is a number.
console.log(Number.isNaN(20)); //false
console.log(Number.isNaN('20')); //false (because it also isn't NaN)
console.log(Number.isNaN(+'20X')); //true (we tried to convert a tring into a number)

console.log(Number.isNaN(23 / 0)); //false (we get infinity, not NaN)
console.log(23 / 0); //Infinity

//Checking if value is finite (is a number)
//There is a better method called isFinite:
console.log(Number.isFinite(20)); //true
console.log(Number.isFinite('20')); //false (is a string)
console.log(Number.isFinite(+'20X')); //false
console.log(Number.isFinite(23 / 0)); //false

//If you are using integers:
console.log(Number.isInteger(23)); //true
console.log(Number.isInteger(23.0)); //true
console.log(Number.isInteger(23.1)); //false

//  ----------------  MATH AND ROUNDING

//Square root:
//Jus like most of the functions, the sqrt is part of the Math namespace
console.log(Math.sqrt(9)); //3
console.log(9 ** (1 / 2)); //3

//Maximum value:
console.log(Math.max(5, 18, 23, 11, 2)); //23
//This max function actuallt does type coercion.
console.log(Math.max(5, 18, '23', 11, 2)); //23
//However, it does not parsing:
console.log(Math.max(5, 18, '23x', 11, 2)); //NaN

//Minimum value:
console.log(Math.min(5, 18, 23, 11, 2)); //2

//There are also constants on the map object:
console.log(Math.PI); //3.141592653589793
console.log(Math.E); //2.718281828459045

//Random function:
console.log(Math.random()); //Number between 0 and 1
console.log(Math.trunc(Math.random() * 6) + 1); //Number between 1 and 6
//Let's generalize this formula to always generate ramdom integers between two values:
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
//0...1 -> 0... (max-min) -> min...(max-min+min)
console.log(randomInt(10, 20));

//Rounding integers:
console.log(Math.trunc(23.3)); //23 (it removes any decimal part)
console.log(Math.trunc(23.9)); //23

console.log(Math.round(23.3)); //23 (it will round to the nearest integer)
console.log(Math.round(23.9)); //24

console.log(Math.ceil(23.3)); //24 (it will round up the number)
console.log(Math.ceil(23.9)); //24

console.log(Math.floor(23.3)); //23 (it will round down the number)
console.log(Math.floor(23.9)); //23

//All of this methods also do type coercion
console.log(Math.floor('23.9')); //23

//Trunc and floor are very similar. They actually do the same when we are dealing with positive numbers. However, for negative numbers it doesn't work this way.
console.log(Math.trunc(-1.25)); //-1
console.log(Math.floor(-1.25)); //-2

//Rounding decimals:
//In decimlas, we have to specify the number like this in parenthesis. And the on that number, we call the toFixed method
console.log((2.7568).toFixed(0)); //'3'
console.log(typeof (2.7568).toFixed(0)); //string

//toFixed will always return a string and not a number.

console.log(+(2.7568).toFixed(3)); //2.757
console.log(+(2.7).toFixed(3)); //2.700 (it adds 0 until the decimel we specify)

//  ----------------  THE REMAINDER OPERATOR (%)

//The remainder operator simply returns the remainder of a division.
console.log(5 % 2); //1
//5 = 2 * 2 + 1

//One thing that is many times used for in programming is to check whether a certain number is even or odd. So even number are 0, 2, 4, 6... and odd numbers are 1, 3, 5, 7...
//When is a number even? It's even if it's divisible by 2. It means that if we divided by 2, the remainder is 0.

const isEven = n => n % 2 === 0;
console.log(isEven(268)); //true
console.log(isEven(75)); //false

//This works to check if any number is divisible by any other number. Whenever the result of the remainder operator is 0, then that means that the first number is completely divisible by the second one.

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orangered';
    }

    if (i % 3 === 0) {
      row.style.backgroundColor = 'blue';
    }
  });
});

//  ----------------  NUMERIC SEPARATORS

//Let's say that we want to represent a really large number
//const diameterSolarSistem = 287460000000;
//It's difficult to read and to understand it. We can use a thousand separator. So numeric separators are underscores that we can place anywhere thet we want in our numbers.
const diameterSolarSistem = 287_460_000_000;
console.log(diameterSolarSistem); //287460000000
//What JS sees is the normal number, the engine ignores the underscores

const priceCents = 345_99;
console.log(priceCents); //34599

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.14_15; //we can place underscores between numbers
console.log(PI); //3.1415

//const PI2 = 3._1415;//Uncaught SyntaxError: Invalid or unexpected token (at script.js:425:13)

//It's not allowed to put the underscore before or after the decimal point, at the beggining or at the end of the number. We can't also put two in a row (__)

//When we try to convert strings that contain underscores to a number, thet will not work as expected:
console.log(Number('230000')); //230000
console.log(Number('230_000')); //NaN
console.log(parseInt('230_000')); //230

//  ----------------  WORKING WITH BIGINT

//We learned that numbers are reprensented internally as 64 bits. That means that there are exactly 64 zeros or ones to represent any given number. Now of these 64 bits, only 53 are used to actually store the digits themselves. The rest are for storing the position of the decimal point and the sign.
//Now if there are only 53 bits to store the number, that means that there is a limit of how big numbers can be.
console.log(2 ** 53 - 1); //9007199254740991
//This is the biggest number that JS can safely represent.
console.log(Number.MAX_SAFE_INTEGER); //9007199254740991 (it's stored in the Number namespace)

//Any integer that is greater than this is not safe, and that means it cannot be represented accurately.

console.log(2 ** 53 - 1); //9007199254740991
console.log(2 ** 53 + 1); //9007199254740992 (it would have to finish with 3)
console.log(2 ** 53 + 0); //9007199254740992

//In some situations we might need really big numbers, for example, for database IDs or when interacting with real 60 bit numbers and these numbers are actually used in other languages.

//Bigint can be used to store numbers as large as we want.

console.log(435484654354131233215555555555555464351); //4.3548465435413124e+38 it could probably lost precision
//For bigint we use the n at the end of the number:
console.log(435484654354131233215555555555555464351n); //435484654354131233215555555555555464351n
//The n transfors a regular number into a bigint number

//We can also create bigints by using the BigInt function:
console.log(BigInt(435484654354131233215555555555555464351));
//But it doesn't give us the same result because JS will first have to still represent the number internally befor it can transform it into a BigInt. It's for small numbers.
console.log(BigInt(435484654354)); //435484654354n

//Operations:
//Al the usual operators still work the same
console.log(10000n + 10000n); //20000n

//What is not possible is to mix BigInt numbers with regular numbers
//console.log(10000n * 2);//Uncaught TypeError: Cannot mix BigInt and other types, use explicit conversions

//We can mix them when comparing:
console.log(20n > 15); //true
console.log(20n === 20); //false (JS when we use the === operator does not do type coercion. And in fact, the values here have differnets primitive types)
console.log(typeof 20); //number
console.log(typeof 20n); //bigint

console.log(20n == 20); //true this does typ coercion

const huge = 55555566666666666668888888888n;

console.log(huge + ' is really big!'); //55555566666666666668888888888 is really big! (it can be converted to a string)

//The Math operations are not gonna work with bigints.
//console.log(Math.sqrt(huge));//Uncaught TypeError: Cannot convert a BigInt value to a number

//Divisions:
console.log(10n / 3n); //3n (it is an integer, it will return the truncked integer)
console.log(10 / 3); //3.3333333333333335

//  ----------------  CREATING DATES

//Create a date:
//There are 4 ways to create a date in JS:
//1)
const now1 = new Date();
console.log(now1); //Mon Nov 21 2022 13:37:55 GMT-0300 (hora estándar de Argentina)

//2)
console.log(new Date('Mon Nov 21 2022 13:37:55')); //Mon Nov 21 2022 13:37:55 GMT-0300 (hora estándar de Argentina)
console.log(new Date('December 24, 2015')); //Thu Dec 24 2015 00:00:00 GMT-0300 (hora estándar de Argentina)

console.log(new Date(account1.movementsDates[0])); //Mon Nov 18 2019 18:31:17 GMT-0300 (hora estándar de Argentina)

//3)
console.log(new Date(2037, 10, 19, 15, 23, 5)); //Thu Nov 19 2037 15:23:05 GMT-0300 (hora estándar de Argentina)
//We have 10 but Nov is the 11th month of the year. It means that the month in JS is zero based.
//the cool with this is that JS autocorrects the day. Let's put nov 31 (november only hay 30 days)
console.log(new Date(2037, 10, 31)); //Tue Dec 01 2037 00:00:00 GMT-0300 (hora estándar de Argentina)

//4)
//We can pass into the date constructor function the amount of milliseconds passed since the beginning of the Unix time, which is January 1,1970:
console.log(new Date(0)); //Wed Dec 31 1969 21:00:00 GMT-0300 (hora estándar de Argentina)
console.log(new Date(100000000)); //Fri Jan 02 1970 00:46:40 GMT-0300 (hora estándar de Argentina)

//These dates are a special type of objects, so they have methods.
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(future); //Thu Nov 19 2037 15:23:05 GMT-0300 (hora estándar de Argentina)
console.log(future.getFullYear()); //2037 (there's also getYear but NEVER USE IT)
console.log(future.getMonth()); //10
console.log(future.getDate()); //19 (it's actually the number of the day of the month)
console.log(future.getDay()); //4 (it's the day of the week. 0 is Sunday)
console.log(future.getHours()); //15
console.log(future.getMinutes()); //23
console.log(future.getSeconds()); //5

console.log(future.toISOString()); //2037-11-19T18:23:05.000Z (Z is the hour at the GMT-0000)

//Getting the timestamp (miliseconds that passed since 01/01/1970)
console.log(future.getTime()); //2142267785000

//Timestamp for now:
console.log(Date.now()); //1669049774663

//Modifying dates:
future.setFullYear(2040);
console.log(future); //Mon Nov 19 2040 15:23:05 GMT-0300 (hora estándar de Argentina)

//  ----------------  ADDING DATES TO THE BANKIST APP

/*
const now = new Date();
const day = `${now.getDate()}`.padStart(2, 0);
const month = `${now.getMonth() + 1}`.padStart(2, 0);
const year = now.getFullYear();
const hour = `${now.getHours()}`.padStart(2, 0);
const min = `${now.getMinutes()}`.padStart(2, 0);
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
*/
//As of Mon Nov 21 2022 14:01:30 GMT-0300 (hora estándar de Argentina)

//We don't wanna see that. We want to see: day/month/year

//  ----------------  OPERATIONS WITH DATES

const future1 = new Date(2037, 10, 19, 15, 23, 5);
console.log(Number(future1)); //2142267785000 (the Number function converts the date to a timestamp. With it we can do operations)

const daysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

console.log(daysPassed(new Date(2037, 3, 14), new Date(2037, 3, 10)));

//  ----------------  INTERNATIONALIZING DATES (INTL)
//See the code of the bakist app

//  ----------------  INTERNATIONALIZING NUMBERS (INTL)
const num = 3458645.23;

//We have also an object, but we can specify other properties:
const options3 = {
  style: 'unit', //percent or currency
  unit: 'mile-per-hour', //celsius, etc
  currency: 'EUR', //WE HAVE TO SET THE CURRENCY. IT'S OT DETERMINATED BY THE LOCALE
  useGrouping: false, //with or without the separators
};

//we have to pass the locale string. Then .format and the number we want to format
console.log('US: ', new Intl.NumberFormat('en-US', options3).format(num)); //'3,458,645.23'
console.log('Germany: ', new Intl.NumberFormat('de-DE', options3).format(num)); //'3.458.645,23'
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options3).format(num)); //'٣٬٤٥٨٬٦٤٥٫٢٣'
console.log(
  'Browser: ',
  new Intl.NumberFormat(navigator.language, options3).format(num)
); //'3,458,645.23'

//To know more of the intl, see the documentation on the MDN.

//  ----------------  TIMERS: SETTIMEOUT AND SETINTERVAL

//We have 2 kind of timers in JS: the settimout timer runs just once after a defined time, while the set interval timer keeps runing basically forever, until we stop it.

//We can use set timeout to execute code at some point in the future.
//The function receives a callback function and the amount of miliseconds that will pass until thi function is called.
setTimeout(() => console.log('Here is your pizza 🍕'), 3 * 1000);

//what's really important to realize here is that the code execution does not stop here at this point. When the execution of our code reaches this point, it will simply call the setTimeout function, it will then essentially register the callback function to be called later, an then the code execution simply continues.

console.log('Waiting...');

//So, how we can pass arguments to the callback function?
//All the arguments that we pass after the delay will be arguments to the function

setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3 * 1000,
  'olives',
  'spinach'
);

//We can actually cancel the timer at least until the delay has actually passed.

const ingredients = ['olives', 'spinach'];
const timer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3 * 1000,
  ...ingredients
);

if (ingredients.includes('spinach')) clearTimeout(timer); //we have to pass the name of the timer

//SET INTERVAL:
//What if we wanted to run a function over and over again, like every five seconds, or every 10 minutes?
/*
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/

//BUILDING A CLOCK:
/*
setInterval(() => {
  const date = new Date();
  const hour = `${date.getHours()}`.padStart(2, 0);
  const minute = `${date.getMinutes()}`.padStart(2, 0);
  const secs = `${date.getSeconds()}`.padStart(2, 0);
  labelTimer.textContent = `${hour}:${minute}:${secs}`;
}, 1000);
*/
//  ----------------  IMPLEMENTING A COUTDOWN TIMER
// Go to line 202

console.log(accounts);
