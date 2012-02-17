"use strict"; "use restrict";

var require = require || function(f) { load(f); };
var Assert = Assert || require("../../../assert.js") || Assert;
var Watch = Watch || require("../watch.js") || Watch;
var v = 123;
var o = {id: v};
var strid = "id";

// o.id
++o.id;
o.id++;
--o.id;
o.id--;
o.id = null || v;
o.id += null || v;
o.id -= null || v;
o.id *= null || v;
o.id /= null || v;
o.id %= null || 2;
o.id &= null || v;
o.id |= null || v;
o.id ^= null || -1;
o.id <<= null || v;
o.id >>= null || v;
o.id >>>= null || 2;
Assert(o.id === 1);

// expr.id
++(null || o).id;
(null || o).id++;
--(null || o).id;
(null || o).id--;
(null || o).id = null || v;
(null || o).id += null || v;
(null || o).id -= null || v;
(null || o).id *= null || v;
(null || o).id /= null || v;
(null || o).id %= null || 2;
(null || o).id &= null || v;
(null || o).id |= null || v;
(null || o).id ^= null || -1;
(null || o).id <<= null || v;
(null || o).id >>= null || v;
(null || o).id >>>= null || 2;
Assert(o.id === 1);

// o["str"]
++o["id"];
o["id"]++;
--o["id"];
o["id"]--;
o["id"] = null || v;
o["id"] += null || v;
o["id"] -= null || v;
o["id"] *= null || v;
o["id"] /= null || v;
o["id"] %= null || 2;
o["id"] &= null || v;
o["id"] |= null || v;
o["id"] ^= null || -1;
o["id"] <<= null || v;
o["id"] >>= null || v;
o["id"] >>>= null || 2;
Assert(o.id === 1);

// expr["str"]
++(null || o)["id"];
(null || o)["id"]++;
--(null || o)["id"];
(null || o)["id"]--;
(null || o)["id"] = null || v;
(null || o)["id"] += null || v;
(null || o)["id"] -= null || v;
(null || o)["id"] *= null || v;
(null || o)["id"] /= null || v;
(null || o)["id"] %= null || 2;
(null || o)["id"] &= null || v;
(null || o)["id"] |= null || v;
(null || o)["id"] ^= null || -1;
(null || o)["id"] <<= null || v;
(null || o)["id"] >>= null || v;
(null || o)["id"] >>>= null || 2;
Assert(o.id === 1);

// o[expr]
++o[null || strid];
o[null || strid]++;
--o[null || strid];
o[null || strid]--;
o[null || strid] = null || v;
o[null || strid] += null || v;
o[null || strid] -= null || v;
o[null || strid] *= null || v;
o[null || strid] /= null || v;
o[null || strid] %= null || 2;
o[null || strid] &= null || v;
o[null || strid] |= null || v;
o[null || strid] ^= null || -1;
o[null || strid] <<= null || v;
o[null || strid] >>= null || v;
o[null || strid] >>>= null || 2;
Assert(o.id === 1);

// expr1[expr2]
++(null || o)[null || strid];
(null || o)[null || strid]++;
--(null || o)[null || strid];
(null || o)[null || strid]--;
(null || o)[null || strid] = null || v;
(null || o)[null || strid] += null || v;
(null || o)[null || strid] -= null || v;
(null || o)[null || strid] *= null || v;
(null || o)[null || strid] /= null || v;
(null || o)[null || strid] %= null || 2;
(null || o)[null || strid] &= null || v;
(null || o)[null || strid] |= null || v;
(null || o)[null || strid] ^= null || -1;
(null || o)[null || strid] <<= null || v;
(null || o)[null || strid] >>= null || v;
(null || o)[null || strid] >>>= null || 2;
Assert(o.id === 1);
