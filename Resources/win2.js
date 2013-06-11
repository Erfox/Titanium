var p_height = Ti.Platform.displayCaps.platformHeight;
var p_width = Ti.Platform.displayCaps.platformWidth;
var version = Titanium.Platform.version.split(".");
var show_web = true;
var currentNote = '';
var currentPrice = 0.0;
var currentPrice_enable = false;
var less_alert_range = 20;
var total_price = 0.0;
var data = [];
var pos = 0;
var rows;
var alert_data = [];
var push_alert;
var tableclick_no;
var tableclick_name;
var tableclick_hasChild;
var find_switch = false;
var display_less_alert = true;
var db = Ti.Database.open('cost');

db.execute("CREATE TABLE IF NOT EXISTS cost (id INTEGER PRIMARY KEY, product TEXT, price FLOAT, time DATETIME, Inventory INTEGER DEFAULT NULL, webexist INTEGER DEFAULT 0)");
try {
	db.execute("ALTER TABLE cost ADD Inventory INTEGER DEFAULT NULL");	
}
catch(e){
	Ti.API.log(e);
}
try {
	db.execute("ALTER TABLE cost ADD webexist INTEGER DEFAULT 0");	
}
catch(e){
	Ti.API.log(e);
}

var entryView = Ti.UI.createView({
	backgroundColor:'#0060AA',
	height:70,
	top:0,
	right:0,
	left:0
});

var button_save = Ti.UI.createButton({
	title:'Save',
	right: 10
});

var textfield1 = Ti.UI.createTextField({
	left: 10,
	width: 'auto',
	autocorrect: 'false',
	keyboardType:Ti.UI.KEYBOARD_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText:'Enter product'
});

var textfield2 = Ti.UI.createTextField({
	left: 130,
	autocorrect: 'false',
	keyboardType:Ti.UI.KEYBOARD_DEFAULT,	
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText:'Enter price'
});

var textfield3 = Ti.UI.createTextField({
	left: 200,
	autocorrect: 'false',
	keyboardType:Titanium.UI.KEYBOARD_DECIMAL_PAD,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText:'Enter count'
});

entryView.add(textfield1);
entryView.add(textfield2);
entryView.add(textfield3);
entryView.add(button_save);
Ti.UI.currentWindow.add(entryView);

textfield1.addEventListener("change",function(e){
	currentNote = e.value;	
});

textfield2.addEventListener("change",function(e){
	currentPrice = parseFloat(e.value);
	currentPrice_enable = true;
});

textfield3.addEventListener('return', function(){
	textfield1.blur();
	textfield2.blur();
	textfield3.blur();
	button_save.fireEvent('click');
});

var web_refresh = Ti.UI.createButton({
	title:'Refresh',
	right: 10,
	bottom:0
});

var count_label = Ti.UI.createLabel({
	left: 10,	
	text : "",
	color: 'black',
	textAlign: 'left'
});

var num_label = Ti.UI.createLabel({
	left: 200,	
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

var tableview = Ti.UI.createTableView({
	data:data,
	top:70,
	bottom:70
});

var a = Titanium.UI.createAlertDialog({
		title:'Select',
		message:'What you want to this row?'
});

var delete_alert = Titanium.UI.createAlertDialog({
		title:'Delete',
		message:'Do you want to delete this row?'
});

tableview.addEventListener('click', function(e){
	tableclick_no=e.rowData.id;
	tableclick_name=e.rowData.product;
	if(e.rowData.hasChild){
		tableclick_hasChild=true;
		a.buttonNames = ['Find','Cancel'];
		a.cancel = 1;
	}
	else{
		tableclick_hasChild=false;
		a.buttonNames = ['Find','Delete','Cancel'];
		a.cancel = 2;
	}		
	a.show();
});

web_refresh.addEventListener('click', function(e){
	var empty_data = [];
	total_price = 0.0;
	tableview.data = empty_data;
	data = empty_data;
	if(find_switch){
		rows = db.execute("SELECT * FROM cost WHERE product = ?", tableclick_name);
		web_refresh.title="Return";
	}
	else{
		rows = db.execute('SELECT * FROM cost');
		web_refresh.title="Refresh";
	}
	find_switch = false
	pos = 0;
	alert_data = [];
	while(rows.isValidRow()){
		if(!show_web && rows.fieldByName('webexist')===1){
			rows.next();
			continue;
		}
		total_price+=rows.fieldByName('price');
		data.push({
			id: rows.fieldByName('id'),		
			product: rows.fieldByName('product'),
			price: rows.fieldByName('price'),
			time: rows.fieldByName('time'),
			header:rows.fieldByName('time'),
			webexist:rows.fieldByName('webexist'),
			Inventory:rows.fieldByName('Inventory'),
			title:rows.fieldByName('product')+" $"+rows.fieldByName('price')
		});
		if(rows.fieldByName('Inventory')!='NaN' && rows.fieldByName('Inventory')!=null)
			data[pos].title+=" remain "+rows.fieldByName('Inventory')
		else
			data[pos].Inventory=null;
		if(rows.fieldByName('webexist')===1)
			data[pos].hasChild=true;
		if(rows.fieldByName('Inventory')!=null && rows.fieldByName('Inventory')<less_alert_range){
			data[pos].color = '#F00';
			if(display_less_alert){
				push_alert=true;
				for(var i=0;i<alert_data.length;i++){
					if(alert_data[i].name==rows.fieldByName('product')){
						push_alert=false;
						break;
					}				
				}
				if(push_alert){
					alert_data.push({
						name: rows.fieldByName('product'),
						left: rows.fieldByName('Inventory')
					});
				}
			}			
		}	
		else
		    data[pos].color = '#000';
		data[pos].font = {fontSize:20, fontWeight:'bold'};
		data[pos].textAlign = 'center';
		pos++;
		rows.next();
	}
	rows.close();
	tableview.data = data;
	var temp_balance=parseInt(total_price*100);
	total_price=parseFloat(temp_balance)/100;
	count_label.text = "Total balance : "+total_price.toString();
	if(p_width>600)
		count_view.value="Total item : "+pos.toString();
	else{
		Ti.UI.createNotification({
			message : "Total item : "+pos.toString()
		}).show();
	}
	if(display_less_alert && alert_data.length>0){
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
	display_less_alert = true;
	Titanium.Media.vibrate();		
});
web_refresh.fireEvent('click');

a.addEventListener('click', function(e){
		if (e.index==0) {			
			find_switch = true;
			display_less_alert = false;
			web_refresh.fireEvent('click');			
		}
		else if (e.index==1 && !tableclick_hasChild) {		
			delete_alert.buttonNames = ['Delete','Cancel'];
			delete_alert.cancel = 1;
			delete_alert.show();
		}
});

delete_alert.addEventListener('click', function(e){
		if (e.index==0) {			
			rows=db.execute("SELECT Inventory FROM cost WHERE product=?", tableclick_name);
			if(rows.isValidRow() && rows.fieldByName('Inventory')!=null && rows.fieldByName('Inventory')!="NaN"){
				var temp_inventory=rows.fieldByName('Inventory')+1;
				db.execute("UPDATE cost SET Inventory=? WHERE product=?", temp_inventory, tableclick_name);				
			}			
			db.execute("DELETE FROM cost WHERE id = ?", tableclick_no);
			display_less_alert=false;
			web_refresh.fireEvent('click');
		}		
});

tableview.addEventListener('delete', function(e){
	rows=db.execute("SELECT Inventory FROM cost WHERE product=?", e.rowData.product);
	if(!(rows.isValidRow()) || rows.fieldByName('Inventory')===null || rows.fieldByName('Inventory')==="NaN"){
		db.execute("DELETE FROM cost WHERE id = ?", e.rowData.id);
	}			
	else{
		var temp_inventory=rows.fieldByName('Inventory')+1;
		db.execute("UPDATE cost SET Inventory=? WHERE product=?", temp_inventory, e.rowData.product);
	}	
});

Ti.UI.currentWindow.add(tableview);
Ti.UI.currentWindow.add(count_view);
count_view.add(count_label);
if(p_width>600){
	count_view.add(num_label);
}
count_view.add(web_refresh);
		
button_save.addEventListener('click', function(e){
	if(currentNote===''){
		alert('Please input infor.');		
		return;
	}	
	if(!currentPrice_enable){
		rows = db.execute("SELECT count(price), max(price) FROM cost WHERE product=?", currentNote);
		if(!(rows.isValidRow()) || rows.fieldByName('count(price)')===0){
			alert('Please input price');
			return;
		}
		currentPrice=rows.fieldByName('max(price)');
	}
	else{
		var check_temp;
		rows = db.execute("SELECT count(*) FROM cost WHERE product=?", currentNote);
		if(rows.isValidRow() && rows.fieldByName('count(*)')>0){
			rows = db.execute("SELECT count(*) FROM cost WHERE product=? AND price<>?", currentNote, currentPrice);
			if(rows.isValidRow() && rows.fieldByName('count(*)')>0){
				alert('Product name already existed');
				return;
			}
		}					
	}
	var temp_inventory;
	if(textfield3.value===""){
		rows = db.execute("SELECT Inventory FROM cost WHERE product=?", currentNote);
		if(!(rows.isValidRow()) || rows.fieldByName('Inventory')===null || rows.fieldByName('Inventory')==="NaN"){
			temp_inventory=null;
		}			
		else{
			temp_inventory=rows.fieldByName('Inventory')-1;
			db.execute("UPDATE cost SET Inventory=? WHERE product=?", temp_inventory, currentNote);
		}
	}
	else
		temp_inventory=parseInt(textfield3.value);
	
	var date2 = new Date();
	var nowdate = date2.getFullYear()+"-";
	var	temp_month = (date2.getMonth()+1);
	var	temp_date = date2.getDate();
	var temp_hour = date2.getHours();
	var temp_min = date2.getMinutes();
	var temp_sec = date2.getSeconds();
	if(temp_month<10)
		nowdate+="0"+temp_month+"-";
	else
		nowdate+=temp_month+"-";
	if(temp_date<10)
		nowdate+="0"+temp_date+' ';
	else
		nowdate+=temp_date+' ';
	if(temp_hour<10)
		nowdate+="0"+temp_hour+":";
	else
		nowdate+=temp_hour+":";
	if(temp_min<10)
		nowdate+="0"+temp_min+':';
	else
		nowdate+=temp_min+':';
	if(temp_sec<10)
		nowdate+="0"+temp_sec;
	else
		nowdate+=temp_sec;
	db.execute('INSERT INTO cost (product, price, time, Inventory, webexist) VALUES(?, ?, ?, ?, ?)', currentNote, currentPrice, nowdate.toString(), temp_inventory, 0);
	//var last = db.lastInsertRowID;
	if(temp_inventory!=null && temp_inventory<less_alert_range){
		alert(currentNote+" only left "+temp_inventory);
	}	
	currentNote = "";
	currentPrice = 0.0;
	currentPrice_enable=false;
	textfield1.value = '';
	textfield1.blur();
	textfield2.value = '';
	textfield2.blur();
	textfield3.value = '';
	textfield3.blur();
	display_less_alert = false;
	web_refresh.fireEvent('click');
});

Ti.App.addEventListener('app:local_refresh',function(e){
	display_less_alert=false;
	web_refresh.fireEvent('click');
});

var menu, m1, m2, m3, m4, m5, m6;
var activity = Ti.UI.currentWindow.activity;
activity.onCreateOptionsMenu = function(e) {
	menu = e.menu;	
	m1 = menu.add({
		itemId : 1,
		groupId : 0,
		order : 0,
		title : 'Product A'
	});
	m1.setIcon("/images/appcelerator_small.png");
	m1.addEventListener('click', function(e) {
		currentNote = 'Product A';
		currentPrice = 200.0;
		currentPrice_enable = true;
		button_save.fireEvent('click');
	});
	
	m2 = menu.add({
		itemId : 2,
		groupId : 0,
		order : 1,
		title : 'Product B'
	});
	m2.setIcon("/images/appcelerator_small2.png");
	m2.addEventListener('click', function(e) {
		currentNote = 'Product B';
		currentPrice = 1500.0;
		currentPrice_enable = true;
		button_save.fireEvent('click');
	});
	
	m3 = menu.add({
		itemId : 3,
		groupId : 0,
		order : 2,
		title : 'Product C'
	});
	m3.setIcon("/images/appcelerator_small.png");
	m3.addEventListener('click', function(e) {
		currentNote = 'Product C';
		currentPrice = 750.5;
		currentPrice_enable = true;
		button_save.fireEvent('click');
	});
	
	m4 = menu.add({
		itemId : 4,
		groupId : 0,
		order : 3,
		title : 'Product D'
	});
	m4.setIcon("/images/appcelerator_small2.png");
	m4.addEventListener('click', function(e) {
		currentNote = 'Product D';
		currentPrice = 49.9;
		currentPrice_enable = true;
		button_save.fireEvent('click');
	});
	m5 = menu.add({
		itemId : 5,
		groupId : 1,
		order : 4,
		title : 'Hidden Web Data'
	});
	m5.addEventListener('click', function(e) {		
		menu.setGroupVisible(1,false);		
		menu.setGroupVisible(2,true);
		show_web=false;
		display_less_alert=false;
		web_refresh.fireEvent('click');
	});
	m6 = menu.add({
		itemId : 6,
		groupId : 2,
		order : 5,
		visible: false,
		title : 'Display Web Data'
	});
	m6.addEventListener('click', function(e) {
		menu.setGroupVisible(1,true);		
		menu.setGroupVisible(2,false);
		show_web=true;
		display_less_alert=false;
		web_refresh.fireEvent('click');
	});
};