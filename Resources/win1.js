var p_height = Ti.Platform.displayCaps.platformHeight;
var p_width = Ti.Platform.displayCaps.platformWidth;
var login = false;
var less_alert_range = 20;
Ti.App.fireEvent('app:login_state',{message: 'false'});
var actInd = Titanium.UI.createActivityIndicator();
actInd.message = 'Connecting';
actInd.setTop(80);
var url0 = true;


var user_input = Ti.UI.createTextField({
	color:'#336699',
	height:80,
	top:p_height/2-80,
	left:10,
	right:10,
	keyboardType:Titanium.UI.KEYBOARD_ASCII,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	autocorrect:false,
	hintText:'Enter User Name'
});

var password_input = Ti.UI.createTextField({
	color:'#336699',
	height:80,
	top:user_input.top+80,
	left:10,
	right:10,
	passwordMask:true,
	keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	autocorrect:false,
	hintText:'Enter Password'
});

var login_button = Ti.UI.createButton({
	title: 'Submit',
	top: password_input.top+80, left: 10, right: 10, height:80,
});

password_input.addEventListener('return',function(e){
	login_button.fireEvent('click');
});

Ti.UI.currentWindow.add(user_input);
Ti.UI.currentWindow.add(password_input);
Ti.UI.currentWindow.add(login_button);
Ti.UI.currentWindow.add(actInd);

var data = [];

login_button.addEventListener('click',function(e){
	actInd.show();
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(e){
			actInd.hide();
		    if(this.responseText==="Accept"){
		    	url0=true;	    	
		    	Ti.App.fireEvent('app:login_url',{message: 'appliee'});		    	
		    	load_web(1);
		    }
	};
	xhr.onerror = function(e){
			xhr.abort();
			backup_login();
	};
	xhr.timeout = 5000;
	var send_data = { username: ""+user_input.value, password: ""+password_input.value };
	xhr.open('GET', 'http://appliee.qov.tw/ti_serv_login.php');
	xhr.send(send_data);
});

function backup_login(){
	var xhr3 = Titanium.Network.createHTTPClient();
	xhr3.onload = function(e){
			actInd.hide();
		    if(this.responseText==="Accept"){
		    	alert("Connect to backup server");
		    	url0=false;    	
		    	Ti.App.fireEvent('app:login_url',{message: 'bpplie'});		    	
		    	load_web(1);
		    }
	};
	xhr3.onerror = function(e){
			alert("Can't connect server");
	};
	xhr3.timeout = 5000;
	var send_data = { username: ""+user_input.value, password: ""+password_input.value };
	xhr3.open('GET', 'http://bpplie.qov.tw/ti_serv_login.php');
	xhr3.send(send_data);
};

var table = Titanium.UI.createTableView({
	left:10,
	top: 10,
	right: 10,
	bottom: 70,
	backgroundColor:'transparent',
	rowBackgroundColor:'black'
});

var web_refresh = Ti.UI.createButton({
	title:'Refresh',
	height:60,
	right: 10,
	bottom:0
});

var count_label = Ti.UI.createLabel({
	left: 10,	
	text : "",
	color: 'black',
	textAlign: 'left'
});

var count_view = Ti.UI.createView({
	backgroundColor:'#0060AA',
	width:'100%',
	height:70,
	bottom:0
});

function load_web(num) {
	if(parseInt(num)===1){
		Ti.UI.currentWindow.remove(user_input);
		Ti.UI.currentWindow.remove(password_input);
		Ti.UI.currentWindow.remove(login_button);
		Ti.UI.currentWindow.add(table);	
		Ti.UI.currentWindow.add(count_view);
		count_view.add(count_label);		
		count_view.add(web_refresh);
		password_input.value = "";
	}
	actInd.message = 'Data loading';
	count_label.text = '';
	actInd.show();
	var xhr2 = Titanium.Network.createHTTPClient();
	xhr2.onload = function(){
		actInd.message = 'Table providing';	
		data = [];
		var total_price = 0;
		table.data = data;
		var json = JSON.parse(this.responseText);	
	    if (!json) 
	        return;
	    var pos;
	    var alert_data = [];
	    var push_alert;
	    for( pos=0; pos < json.cost.length; pos++){
	    	total_price+=parseInt(parseFloat(json.cost[pos].price)*100);
	    	data.push({
	    		id: json.cost[pos].id,
				product: json.cost[pos].product,
				price: json.cost[pos].price,
				time: json.cost[pos].time,
				Inventory: json.cost[pos].Inventory,
				header: json.cost[pos].time,
				title: json.cost[pos].product+": $"+json.cost[pos].price
	    	});
			if(json.cost[pos].Inventory!=null && json.cost[pos].Inventory<less_alert_range){
				data[pos].color = '#F00';
				push_alert=true;
				for(var i=0;i<alert_data.length;i++){
					if(alert_data[i].name==json.cost[pos].product){
						push_alert=false;
						break;
					}				
				}
				if(push_alert){
					alert_data.push({
						name: json.cost[pos].product,
						left: json.cost[pos].Inventory
					});
				}				
			}				
			else
	    		data[pos].color = '#000';
			data[pos].font = {fontSize:20, fontWeight:'bold'};
			data[pos].textAlign = 'center';
	    }
	    count_label.text = "Total balance : "+parseFloat(total_price)/100;
	    table.data = data;
	    actInd.hide();
	    login = true;
	    if(alert_data.length>0){
	    	var temp_alert_message = "";
	    	for(var i=0;i<alert_data.length;i++){
	    		if(i==0){
	    			temp_alert_message=alert_data[i].name+" only left "+alert_data[i].left;
	    		}
	    		else
	    			temp_alert_message+="\n"+alert_data[i].name+" only left "+alert_data[i].left;
	    	}
	    	alert(temp_alert_message);
	    }
		Ti.App.fireEvent('app:login_state',{message: 'true'});
	};
	
	xhr2.onerror = function(e){
		actInd.hide();
		Ti.UI.currentWindow.add(user_input);
		Ti.UI.currentWindow.add(password_input);
		Ti.UI.currentWindow.add(login_button);
		Ti.UI.currentWindow.remove(table);	
		Ti.UI.currentWindow.remove(count_view);
		count_view.remove(count_label);		
		count_view.remove(web_refresh);
		login = false;
		Ti.App.fireEvent('app:login_state',{message: 'false'});
		alert(e.error);
	};
	xhr2.timeout = 5000;
	if(url0)
		xhr2.open('GET', 'http://appliee.qov.tw/ti_serv.php');
	else
		xhr2.open('GET', 'http://bpplie.qov.tw/ti_serv.php');
	xhr2.send();
}

Ti.App.addEventListener('app:login_confirm',function(e){	
	if(login){
		if(url0)
			Ti.App.fireEvent('app:login_url',{message: 'appliee'});
		else
			Ti.App.fireEvent('app:login_url',{message: 'bpplie'});
		Ti.App.fireEvent('app:login_state',{message: 'true'});
	}
	else
		Ti.App.fireEvent('app:login_state',{message: 'false'});
});

Ti.App.addEventListener('app:web_refresh',function(e){
	load_web(0);
});

Ti.App.addEventListener('app:downdata',function(e){
	var db = Ti.Database.open('cost');
	db.execute('DROP TABLE cost');
	db.execute("CREATE TABLE IF NOT EXISTS cost (id INTEGER PRIMARY KEY, product TEXT, price FLOAT, time DATETIME, Inventory INTEGER DEFAULT NULL, webexist INTEGER DEFAULT 0)");
	var i;
	for(i=0;i<data.length;i++){	
		db.execute('INSERT INTO cost (product, price, time, Inventory, webexist) VALUES(?, ?, ?, ?, ?)', data[i].product, data[i].price, data[i].time, data[i].Inventory, 1);
	}
	db.close();
	Ti.App.fireEvent('app:local_refresh',{message: 'local_refresh'});
	Titanium.Media.vibrate();
	Ti.UI.createNotification({
		message : 'Replace completed'
	}).show();
	Titanium.Media.vibrate();
});

web_refresh.addEventListener('click', function(e){
	load_web(0);
});

table.addEventListener('click', function(e){
	if(e.rowData.Inventory){
		Ti.UI.createNotification({
			message : "Count : "+e.rowData.Inventory
		}).show();
	};
	
});
