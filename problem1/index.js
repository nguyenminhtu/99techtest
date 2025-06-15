// The first approach: just add up all the numbers one by one
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// The second approach: use the math trick that save us from doing all the adding above
var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

// The third approach: use recursion
var sum_to_n_c = function (n) {
  if (n <= 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_c(n - 1);
};
