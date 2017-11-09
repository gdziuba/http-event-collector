var https = require("https");
const querystring = require('querystring');    
//var request = require("request");


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        var myMessage = null;



        /**
         * Only the token property is required.
         */
        this.myURI = config.inputURI.toString();
        this.myToken = config.inputToken.toString();
        this.mySourcetype = config.inputSourcetype.toString();
        this.myHost = config.inputHost.toString();
        this.mySource = config.inputSource.toString();
        this.myIndex = config.inputIndex.toString();

        var config = {
            token: this.myToken,
            url: this.myURI
        };

        //var splunkStream = splunkBunyan.createStream(config);

        // Create a new logger



        this.on('input', function(msg) {

            try{
                myMessage = JSON.parse(msg.payload)
            }
            catch(err){
                myMessage = msg.payload
            }

            var postData = JSON.stringify(myMessage);
            //var postData = '{"time": 1510200032.000,"event":"metric","source":"disk","host":"host_99","fields":{"region":"us-west-1","datacenter":"us-west-1a","rack":"63","os":"Ubuntu16.10","arch":"x64","team":"LON","service":"6","service_version":"0","service_environment":"test","path":"/dev/sda1","fstype":"ext3","_value":1099511627776,"metric_name":"total"}}';
                
            console.log("postData:",postData);

            var options = {
                hostname: "ec2-54-85-94-34.compute-1.amazonaws.com",
                port: 8088,
                protocol: "https:",
                path: "/services/collector",
                method: 'POST',
                headers: {
                    Authorization: 'Splunk 5e5f1c02-4471-4218-b7ab-1785921f7993'
                    //'Content-Length': Buffer.byteLength(postData)
                }
            };
            console.log("headers:", options.headers);

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
              
            var req = https.request(options, (res) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers);
              
                res.on('data', (d) => {
                    process.stdout.write(d);
                });
            });
            //console.log("req", req);
              
            req.on('error', (e) => {
                console.error(e);
            });
            // write data to request body
            req.write(postData);
            req.end();
                      


        });
    }
    RED.nodes.registerType("http-event-collector-metric",HTTPEventCollector);
};
