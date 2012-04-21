"use strict"; "use restrict";

var require = require || function(f) { load(f); };
var Assert = Assert || require("../../../assert.js") || Assert;
var Watch = Watch || require("../watch.js") || Watch;
var v = 123;
var o = {id: v};
var strid = "id";

// o.id
Watch.set("++v", o, "id");
Watch.set("v++", o, "id");
Watch.set("--v", o, "id");
Watch.set("v--", o, "id");
Watch.set("=", o, "id", null || v);
Watch.set("+=", o, "id", null || v);
Watch.set("-=", o, "id", null || v);
Watch.set("*=", o, "id", null || v);
Watch.set("/=", o, "id", null || v);
Watch.set("%=", o, "id", null || 2);
Watch.set("&=", o, "id", null || v);
Watch.set("|=", o, "id", null || v);
Watch.set("^=", o, "id", null || -1);
Watch.set("<<=", o, "id", null || v);
Watch.set(">>=", o, "id", null || v);
Watch.set(">>>=", o, "id", null || 2);
Assert(o.id === 1, "o.id === 1, function <script>, file plugins/watcher/tests/forms.js, line 27");

// expr.id
Watch.set("++v", (null || o), "id");
Watch.set("v++", (null || o), "id");
Watch.set("--v", (null || o), "id");
Watch.set("v--", (null || o), "id");
Watch.set("=", (null || o), "id", null || v);
Watch.set("+=", (null || o), "id", null || v);
Watch.set("-=", (null || o), "id", null || v);
Watch.set("*=", (null || o), "id", null || v);
Watch.set("/=", (null || o), "id", null || v);
Watch.set("%=", (null || o), "id", null || 2);
Watch.set("&=", (null || o), "id", null || v);
Watch.set("|=", (null || o), "id", null || v);
Watch.set("^=", (null || o), "id", null || -1);
Watch.set("<<=", (null || o), "id", null || v);
Watch.set(">>=", (null || o), "id", null || v);
Watch.set(">>>=", (null || o), "id", null || 2);
Assert(o.id === 1, "o.id === 1, function <script>, file plugins/watcher/tests/forms.js, line 46");

// o["str"]
Watch.set("++v", o, "id");
Watch.set("v++", o, "id");
Watch.set("--v", o, "id");
Watch.set("v--", o, "id");
Watch.set("=", o, "id", null || v);
Watch.set("+=", o, "id", null || v);
Watch.set("-=", o, "id", null || v);
Watch.set("*=", o, "id", null || v);
Watch.set("/=", o, "id", null || v);
Watch.set("%=", o, "id", null || 2);
Watch.set("&=", o, "id", null || v);
Watch.set("|=", o, "id", null || v);
Watch.set("^=", o, "id", null || -1);
Watch.set("<<=", o, "id", null || v);
Watch.set(">>=", o, "id", null || v);
Watch.set(">>>=", o, "id", null || 2);
Assert(o.id === 1, "o.id === 1, function <script>, file plugins/watcher/tests/forms.js, line 65");

// expr["str"]
Watch.set("++v", (null || o), "id");
Watch.set("v++", (null || o), "id");
Watch.set("--v", (null || o), "id");
Watch.set("v--", (null || o), "id");
Watch.set("=", (null || o), "id", null || v);
Watch.set("+=", (null || o), "id", null || v);
Watch.set("-=", (null || o), "id", null || v);
Watch.set("*=", (null || o), "id", null || v);
Watch.set("/=", (null || o), "id", null || v);
Watch.set("%=", (null || o), "id", null || 2);
Watch.set("&=", (null || o), "id", null || v);
Watch.set("|=", (null || o), "id", null || v);
Watch.set("^=", (null || o), "id", null || -1);
Watch.set("<<=", (null || o), "id", null || v);
Watch.set(">>=", (null || o), "id", null || v);
Watch.set(">>>=", (null || o), "id", null || 2);
Assert(o.id === 1, "o.id === 1, function <script>, file plugins/watcher/tests/forms.js, line 84");

// o[expr]
Watch.set("++v", o, String(null || strid));
Watch.set("v++", o, String(null || strid));
Watch.set("--v", o, String(null || strid));
Watch.set("v--", o, String(null || strid));
Watch.set("=", o, String(null || strid), null || v);
Watch.set("+=", o, String(null || strid), null || v);
Watch.set("-=", o, String(null || strid), null || v);
Watch.set("*=", o, String(null || strid), null || v);
Watch.set("/=", o, String(null || strid), null || v);
Watch.set("%=", o, String(null || strid), null || 2);
Watch.set("&=", o, String(null || strid), null || v);
Watch.set("|=", o, String(null || strid), null || v);
Watch.set("^=", o, String(null || strid), null || -1);
Watch.set("<<=", o, String(null || strid), null || v);
Watch.set(">>=", o, String(null || strid), null || v);
Watch.set(">>>=", o, String(null || strid), null || 2);
Assert(o.id === 1, "o.id === 1, function <script>, file plugins/watcher/tests/forms.js, line 103");

// expr1[expr2]
Watch.set("++v", (null || o), String(null || strid));
Watch.set("v++", (null || o), String(null || strid));
Watch.set("--v", (null || o), String(null || strid));
Watch.set("v--", (null || o), String(null || strid));
Watch.set("=", (null || o), String(null || strid), null || v);
Watch.set("+=", (null || o), String(null || strid), null || v);
Watch.set("-=", (null || o), String(null || strid), null || v);
Watch.set("*=", (null || o), String(null || strid), null || v);
Watch.set("/=", (null || o), String(null || strid), null || v);
Watch.set("%=", (null || o), String(null || strid), null || 2);
Watch.set("&=", (null || o), String(null || strid), null || v);
Watch.set("|=", (null || o), String(null || strid), null || v);
Watch.set("^=", (null || o), String(null || strid), null || -1);
Watch.set("<<=", (null || o), String(null || strid), null || v);
Watch.set(">>=", (null || o), String(null || strid), null || v);
Watch.set(">>>=", (null || o), String(null || strid), null || 2);
Assert(o.id === 1, "o.id === 1, function <script>, file plugins/watcher/tests/forms.js, line 122");
