// Copyright 2011 Splunk, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

// This example will login to Splunk, perform a regular search, wait until
// it is done, and then print out the raw results and some key-value pairs

var splunkjs = require('splunk-sdk');
var Async  = splunkjs.Async;

module.exports = function(RED) {
    function splunksearch(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;

        this.on('input', function(msg) {

            console.log("We got passed the first step")

            exports.main = function(opts, callback) {
                // This is just for testing - ignore it
                opts = opts || {};

                this.myPort = config.inputPort.toString();
                this.myHost = config.inputHost.toString();
                this.mySearch = config.inputSearch.toString();
                this.myUsername = config.inputUsername.toString();
                this.myPassword = config.inputPassword.toString();
                this.myVersion = config.inputVersion.toString();

                console.log("We got passed the second step")
                
                var username = opts.username    || this.myUsername;
                var password = opts.password    || this.myPassword;
                var scheme   = opts.scheme      || "https";
                var host     = opts.host        || this.myHost
                var port     = opts.port        || this.myPort;
                var version  = opts.version     || this.myVersion;
                
                var service = new splunkjs.Service({
                    username: username,
                    password: password,
                    scheme: scheme,
                    host: host,
                    port: port,
                    version: version
                });

                var Search = this.mySearch


                console.log("Search:",Search);

                Async.chain([
                        // First, we log in
                        function(done) {
                            service.login(done);
                            console.log("we Tried to log in")
                            console.log("Search:",Search);
                        },
                        // Perform the search
                        function(success, done) {
                            console.log("We are trying to send the search")
                            if (!success) {
                                done("Error logging in");
                                console.log("can't log in")
                            }
                            console.log("We sent the search")
                            service.search(Search, {}, done);
                        },
                        // Wait until the job is done
                        function(job, done) {
                            job.track({}, function(job) {
                                // Ask the server for the results
                                job.results({}, done);
                                console.log("We have results")
                            });
                        },
                        // Print out the statistics and get the results
                        function(results, job, done) {
                            // Print out the statics
                            console.log("Job Statistics: ");
                            console.log("  Event Count: " + job.properties().eventCount);
                            console.log("  Disk Usage: " + job.properties().diskUsage + " bytes");
                            console.log("  Priority: " + job.properties().priority);

                            // Find the index of the fields we want
                            var rawIndex = results.fields.indexOf("_raw");
                            var sourcetypeIndex = results.fields.indexOf("sourcetype");
                            var userIndex = results.fields.indexOf("user");

                            console.log("results.fields:",results.fields);
                            
                            // Print out each result and the key-value pairs we want
                            console.log("Results: ");
                            for(var i = 0; i < results.rows.length; i++) {
                                console.log("  Result " + i + ": ");
                                console.log("    sourcetype: " + results.rows[i][sourcetypeIndex]);
                                console.log("    user: " + results.rows[i][userIndex]);
                                console.log("    _raw: " + results.rows[i][rawIndex]);
                            }
                            
                            // Once we're done, cancel the job.
                            job.cancel(done);
                        }
                    ],
                    function(err) {
                        console.log("error:",err); 
                        callback(err);   
                    }
                );
            };

            
            exports.main({}, function() {});
            
        });
    }
    RED.nodes.registerType("splunk-search",splunksearch);
};