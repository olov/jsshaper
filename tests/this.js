var o = {fn: function() { print(this === o); }};
o.fn();
(o.fn)();
(false || o.fn)();
