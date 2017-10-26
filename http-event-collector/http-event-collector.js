/*
 * Copyright 2015 Splunk, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"): you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        var myMessage = null;


        // Change to require("splunk-logging").Logger;
        var SplunkLogger = require("../node_modules/splunk-bunyan-logger/index").Logger;


        /**
         * Only the token property is required.
         */
        this.myURI = config.inputURI.toString();
        this.myToken = config.inputToken.toString();
        this.mySourcetype = config.inputSourcetype.toString();
        this.myHost = config.inputHost.toString();
        this.mySource = config.inputSource.toString();
        this.myIndex = config.inputIndex.toString();


        // Token and URI data
        var loggerConfig = {
            token: this.myToken,
            url: this.myURI
        };

        // Create a new logger
        var Logger = new SplunkLogger(loggerConfig);

        Logger.error = function(err, context) {
            // Handle errors here
            console.log("error", err, "context", context);
        };


        this.on('input', function(msg) {

            // Attempt to convert msg.payload to a json structure.
            try{
                myMessage = JSON.parse(msg.payload)
            }
            catch(err){
                myMessage = msg.payload
            }


            // Define the payload to send to HTTP Event Collector
            var payload = {
                // Data sent from previous node msg.payload
                message : { payload: myMessage,
                msgMetaData : msg
                },
                // Metadata
                metadata: {
                    source: this.mySource,
                    sourcetype: this.mySourcetype,
                    index: this.myIndex,
                    host: this.myHost
                },
                // Severity is also optional
                severity: "info"
            };

            // removes duplication of data

            delete payload.message.msgMetaData.payload;

            console.log("Sending payload", payload);

            /**
             * Since maxBatchCount is set to 1 by default,
             * calling send will immediately send the payload.
             *
             * The underlying HTTP POST request is made to
             *
             *     https://localhost:8088/services/collector/event/1.0
             *
             * with the following body
             *
             *     {
             *         "source": "chicken coop",
             *         "sourcetype": "httpevent",
             *         "index": "main",
             *         "host": "farm.local",
             *         "event": {
             *             "message": {
             *                 "temperature": "70F",
             *                 "chickenCount": 500
             *             },
             *             "severity": "info"
             *         }
             *     }
             *
             */
            Logger.send(payload, function(err, resp, body) {
                // If successful, body will be { text: 'Success', code: 0 }
                console.log("Response from Splunk", body);
            });
        });
    }
    RED.nodes.registerType("http-event-collector",HTTPEventCollector);
};
