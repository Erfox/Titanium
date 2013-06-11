var p_height = Ti.Platform.displayCaps.platformHeight;
var p_width = Ti.Platform.displayCaps.platformWidth;
var login_return = "";
var url0=true;

Ti.App.addEventListener('app:login_url', function(e){
		if(e.message=='appliee'){
			url0=true;
		}
		else{
			url0=false;
		}
});

Ti.App.addEventListener('app:login_state', function(e){
		login_return = e.message;
});

var actInd = Titanium.UI.createActivityIndicator();
actInd.message = 'Connecting';
actInd.setTop(80);

var download_alert = Titanium.UI.createAlertDialog({
		title:'Replace',
		message:'Do you wantta replace all local data?'
});

var upload_alert = Titanium.UI.createAlertDialog({
		title:'Upload',
		message:'Do you wantta upload new data?'
});


var delete_alert = Titanium.UI.createAlertDialog({
		title:'Delete',
		message:'Do you want to delete all local data?'
});
var count_button = Ti.UI.createButton({
	height:80,
	top:p_height/2-160,
	left:10,
	right:10,
	title:'Counting'
});

var download_button = Ti.UI.createButton({
	height:80,
	top:p_height/2-80,
	left:10,
	right:10,
	title:'Download'
});

var upload_button = Ti.UI.createButton({
	height:80,
	top:p_height/2,
	left:10,
	right:10,
	title:'Upload'
});

var clear_button = Ti.UI.createButton({
	title: 'Clear Local Data',
	top: upload_button.top+80, left: 10, right: 10, height:80,
});

count_button.addEventListener('click',function(e){
	var SubWin = require('find');
	var options = {
		backgroundColor:'#336699',
		bottom:0,
		top:0,
		right:0,
		left:0
	};
	options.navBarHidden = true;
	var subwin = new SubWin(options);
	var a = Titanium.UI.createAnimation();
	a.height = Titanium.Platform.displayCaps.platformHeight;
	a.width = Titanium.Platform.displayCaps.platformWidth;
	a.duration = 300;
	
	var close = Titanium.UI.createButton({
		title:'Close',
		height:50*(p_height/480),
		left:10,
		right:10,
		bottom:10
	});
	subwin.add(close);
	close.addEventListener('click', function()
	{
		a.height = 0;
		a.width = 0;
		subwin.close();
	});
	subwin.open(a);
});

download_button.addEventListener('click',function(e){
	download_alert.buttonNames = ['OK','Cancel'];
	download_alert.cancel = 1;
	download_alert.show();
});

download_alert.addEventListener('click', function(e){
	if (e.index==0) {
		Ti.App.fireEvent('app:login_confirm',{message: 'login_confirm'});
		if(login_return==='true'){
			Ti.App.fireEvent('app:downdata',{message: 'downdata'});
		}
		else
			alert('Please login in the Web page first');
	}
});

upload_button.addEventListener('click',function(e){
	upload_alert.buttonNames = ['OK','Cancel'];
	upload_alert.cancel = 1;
	upload_alert.show();
});

upload_alert.addEventListener('click',function(e){
	if(e.index==0){
		Ti.App.fireEvent('app:login_confirm',{message: 'login_confirm'});
		if(login_return==='true'){
			var db = Ti.Database.open('cost');
			if(db.execute("SELECT name FROM sqlite_master WHERE type= 'table' AND name =  'cost'").isValidRow()){
				var rows = db.execute('SELECT * FROM cost');				
				db.close();
				var pos = 0;
				var data = [];
				while(rows.isValidRow()){
					if(rows.fieldByName('webexist')===1){						
						rows.next();
						continue;
					}
					data.push({
						id: rows.fieldByName('id'),		
						product: rows.fieldByName('product'),
						price: rows.fieldByName('price'),
						Inventory: rows.fieldByName('Inventory'),
						time: rows.fieldByName('time')
					});
					if(rows.fieldByName('Inventory')=='NaN' || rows.fieldByName('Inventory')==null || rows.fieldByName('Inventory')=='null')
						data[pos].Inventory=null;
					else
						data[pos].Inventory+=1;
					pos++;
					rows.next();
				}
				rows.close();
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function(e){
					if(this.responseText==="Accept"){
						Titanium.Media.vibrate();
						Ti.UI.createNotification({
							message : "Upload success"
						}).show();
						Ti.App.fireEvent('app:web_refresh',{message: 'from_unload'});
						db = Ti.Database.open('cost');
						db.execute('UPDATE cost SET webexist=1');
						db.close();
						Ti.App.fireEvent('app:local_refresh',{message: 'from_unload'});			
						Titanium.Media.vibrate();
					}
				};
				xhr.onerror = function(e){
					Titanium.Media.vibrate();
					alert("Can't connect server");
				};
				xhr.timeout = 5000;
				var data2 = '{"data":'+JSON.stringify(data)+'}';
				var send_data = { data: data2 } ;
				if(url0)
					xhr.open('POST', 'http://appliee.qov.tw/ti_serv_upload.php');
				else
					xhr.open('POST', 'http://bpplie.qov.tw/ti_serv_upload.php');
				xhr.send(send_data);
			}
		}
		else
			alert('Please login in the Web page first');
	}
});

clear_button.addEventListener('click',function(e){
	delete_alert.buttonNames = ['Delete','Cancel'];
	delete_alert.cancel = 1;
	delete_alert.show();
});

delete_alert.addEventListener('click', function(e){
		if (e.index==0) {			
			var db = Ti.Database.open('cost');
			db.execute('DELETE FROM cost');
			db.close();
			Titanium.Media.vibrate();
			Ti.App.fireEvent('app:local_refresh',{message: 'local_refresh'});
			Ti.UI.createNotification({
				message : 'Delete complete'
			}).show();				
		}
});

Ti.UI.currentWindow.add(count_button);
Ti.UI.currentWindow.add(download_button);
Ti.UI.currentWindow.add(upload_button);
Ti.UI.currentWindow.add(clear_button);
Ti.UI.currentWindow.add(actInd);