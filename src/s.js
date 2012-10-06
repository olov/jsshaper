/**
 * @license s.js 0.0.0 Copyright (c) 2011 C. Scott Ananian, portions Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

// RequireJS loader: use s!<plugin>!<filename> to load filename, processed
// through the given Shaper <plugin>.

/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, process: false, window: false */

(function () {

    var fs, getXhr,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        fetchText = function () {
            throw new Error('Environment unsupported.');
        },
        buildMap = [];



    if (typeof window !== "undefined" && window.navigator && window.document) {
        // Browser action
        getXhr = function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else {
                for (i = 0; i < 3; i++) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            if (!xhr) {
                throw new Error("getXhr(): XMLHttpRequest not available");
            }

            return xhr;
        };

        fetchText = function (url, callback) {
            var xhr = getXhr();
            xhr.open('GET', url, true);
            // XXX FOR DEVELOPMENT
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            xhr.setRequestHeader('Pragma', 'no-cache');
            // XXX END DEVELOPMENT
            xhr.onreadystatechange = function (evt) {
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    callback(xhr.responseText);
                }
            };
            xhr.send(null);
        };
        // end browser.js adapters
    } else if (typeof process !== "undefined" &&
               process.versions &&
               !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');
        fetchText = function (path, callback) {
            callback(fs.readFileSync(path, 'utf8'));
        };
    }

    define(['require', './shaper'], function(require, Shaper) {

        return {
        version: '0.1.0',

        load: function (name, parentRequire, load, config) {
            // extract pipeline
            var bang = name.lastIndexOf('!'), prefix="";
            if (bang >= 0) {
                var prefix = name.substring(0, bang);
                name = name.substring(bang + 1);
            }
            // load the plugin
            var pluginPaths = {
                yielder: './plugins/yielder/yielder',
                restricter: './plugins/restricter',
            };
            var ppath = prefix;
            if (prefix in pluginPaths) {
                ppath = pluginPaths[prefix];
            }
            var withPlugin= function(plugin) {
                if (!plugin) {
                    plugin = Shaper.get(prefix);
                }
                var path = parentRequire.toUrl(name + '.js');
                fetchText(path, function (text) {

                    //Reshape the text
                    var origText = text;
                    try {
                        var root = Shaper.parseScript(origText, path);
                        // find top-level call(s) to define() and hack the
                        // dependencies to also use this loader.
                        var hackdeps = function(root) {
                            var tmpl = Shaper.parse("define([$$], $$)");
                            return Shaper.traverse(root, {
                                pre: function(node, ref) {
                                    if (Shaper.match(tmpl, node)) {
                                        var args = node.children[1].children[0];
                                        args.children.forEach(function(a) {
                                            if (a.value.indexOf('!')>=0) {
                                                return; // skip this one
                                            }
                                            a.value = 's!'+prefix+'!'+a.value;
                                            // XXX should use real str escape
                                            a.srcs[0]=JSON.stringify(a.value);
                                        });
                                        // XXX should add generator, iterator,
                                        //     stopiteration
                                    }
                                }
                            });
                        };
                        root = Shaper.run(root, [plugin, hackdeps]);
                        text = root.getSrc();
//                        console.log("shaper produced "+ name +": "+ text);
                    } catch (e) {// throw e;
                        var msg = "Could not compile: "+path;
                        msg += " ("+e.toString();
                        if (e.filename) { msg += ' ' + e.filename; }
                        if (e.lineno) { msg += ':' + e.lineno; }
                        msg += ")";
                        throw new Error(msg);
                    }

                    //Hold on to the transformed text if a build.
                    if (config.isBuild) {
                        buildMap[name] = text;
                    }

                    //IE with conditional comments on cannot handle the
                    //sourceURL trick, so skip it if enabled.
                    /*@if (@_jscript) @else @*/
                    if (!config.isBuild) {
                        text += "\r\n//@ sourceURL=" + path;
                    }
                    /*@end@*/

                    load.fromText(name, text);

                    //Give result to load. Need to wait until the module
                    //is fully parsed, which will happen after this
                    //execution.
                    parentRequire([name], function (value) {
                        load(value);
                    });
                });
            };
            if (Shaper.get(prefix)) {
                withPlugin(Shaper.get(prefix));
            } else {
                require([ppath], withPlugin);
            }
        },

        write: function (pluginName, name, write) {
            if (name in buildMap) {
                var text = buildMap[name];
                write.asModule(pluginName + "!" + name, text);
            }
        }
        };
    });

}());
