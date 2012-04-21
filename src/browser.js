// Simple demo using features provided by the 'yielder' transformation.
define(['!./plugins/yielder/generator','!./plugins/yielder/iterator','!./plugins/yielder/stopiteration'], function(Generator, Iterator, StopIteration) {

// array comprehensions
function range(begin, end) {
  for (var i = begin; i < end; ++i) {
    yield i;
  }
}

var output = '';

var ten_squares = [ i * i for each (i in range(0, 10))];
output += ten_squares.join(',') + "\n";

var evens = [ /*a*/ i for each (i in range(0, 21)) if (i % 2 == 0)];
output += evens.join(',') + "\n";


/* generator expressions */
function foo(it) {
    return it.next();
}
output += foo(i for each (i in range(1, 5))) + "\n";

document.getElementById('output').innerHTML = output;
});
