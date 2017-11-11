var https = require("https");
const querystring = require('querystring');    
//var request = require("request");


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        var myMessage = null;


        this.myToken = config.inputToken.toString();
        this.myHostname = config.inputHostname.toString();
        this.mySource = config.inputSource.toString();
        this.myPort = config.inputPort.toString();


        this.on('input', function(msg) {

            var dims = null;
            var hName = this.myHostname
            var re = /(https:\/\/|http:\/\/)/;
            var re2 = /(www)/;
            var count = 0;
            var postData = ""

            // Remove https://, http://, and www
            hName = hName.replace(re,'');
            hName = hName.replace(re2,'');

            try{
                myMessage = JSON.parse(msg.payload)
            }
            catch(err){
                myMessage = msg.payload;
                console.log("payload isn't json or has already converted");
            }

            //console.log(myMessage.values);
        
            if (myMessage.Splunkdims != null){
                dims = myMessage.fields.Splunkdims
            }


            var myArray = myMessage.values;
            

            function countMyValue(){
                return myArray.length;
            }
            count = countMyValue();

            console.log("count:",count);

            for (i=0; i < count; i++){
                var metricName = myArray[i].id.replace(/ /g,'');
                var TempArrayLength = 0
                // Build New Structure
                var _TemplateStructure = {
                    time: myArray[i].t,
                    event: "metric",
                    source: this.mySource,
                    host: hName,
                    fields:{
                        metric_name: metricName,
                        _value: myArray[i].v,
                        q: myArray[i].q,
                        t: myMessage.timestamp
                    }
                }
                

                if (myMessage.host != null){
                    _TemplateStructure.host = myMessage.host;
                }
                if (myMessage.time != null){
                    _TemplateStructure.time = myMessage.time;
                }
                
                // Check to see if value is Array and break out array
                try{
                    var myValue = JSON.parse("[" + _TemplateStructure.fields._value + "]");
                }
                catch (e){ 
                }
                function LengthTempArray(){
                    return myValue[0].length;
                }
                TempArrayLength = LengthTempArray();
                

                if (TempArrayLength > 1){
                    var TempMetricName = _TemplateStructure.fields.metric_name;
        
                    
                    for (x=0;x < TempArrayLength; x++){
                        _TemplateStructure.fields._value = myValue[0][x];
                        _TemplateStructure.fields.metric_name = TempMetricName.concat(x.toString())
                        postData = postData.concat(JSON.stringify(_TemplateStructure));
                    }

                }
                else{

                    if (isNaN(_TemplateStructure.fields._value) === false && _TemplateStructure.fields._value != null 
                    && typeof(_TemplateStructure.fields._value) != "boolean"){
                        postData = postData.concat(JSON.stringify(_TemplateStructure));
                    }
                    else {
                        console.log("msg.event._value is not a number:", _TemplateStructure.fields._value);
                    }
                }
            }

            // concant Authorization for "Splunk" to Token
            var SplunkString = "Splunk ";
            var Token = this.myToken.toString();
            var AuthorizationString = SplunkString.concat(Token);

            var options = {
                hostname: hName,
                port: this.myPort,
                protocol: "https:",
                path: "/services/collector",
                method: 'POST',
                headers: {
                    Authorization: AuthorizationString
                    //'Content-Length': Buffer.byteLength(postData)
                }
            };
            //console.log("headers:", options.headers);

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
              
            var req = https.request(options, (res) => {
                //console.log('statusCode:', res.statusCode);
                //console.log('headers:', res.headers);
              
                res.on('data', (d) => {
                    process.stdout.write(d);
                    console.log('\n');
                });
            });
              
            req.on('error', (e) => {
                console.error(e);
            });
            
            // write data to request body and make sure the _value is valid
            
            req.write(postData);
            req.end();
            

        });
    }
    RED.nodes.registerType("kepware-iot-gateway-to-splunk-metric",HTTPEventCollector);
};
