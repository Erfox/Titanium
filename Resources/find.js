function find() {
	var p_width = Ti.Platform.displayCaps.platformWidth;
	var p_height = Ti.Platform.displayCaps.platformHeight;
	var win = Titanium.UI.createWindow({
		backgroundColor:'#336699'
	});		
	var temp_month, temp_date;
	var b1 = Titanium.UI.createButton({
		title:'Today',
		height:40*(p_height/480),
		left:10,
		right:p_width/2-10,	
		top:10
	});
	
	var b11 = Titanium.UI.createButton({
		title:'All day',
		height:40*(p_height/480),
		left:p_width/2+10,
		right:10,	
		top:10
	});	
	
	var value = new Date();		
	var searchdate=value.getFullYear()+"-";
	temp_month=(value.getMonth()+1);
	temp_date=value.getDate();
	if(temp_month<10)
		searchdate+="0"+temp_month+"-";
	else
		searchdate+=temp_month+"-";
	if(temp_date<10)
		searchdate+="0"+temp_date;
	else
		searchdate+=temp_date;
		
	var picker = Ti.UI.createPicker({
		top:60,
		height:240*(p_height/480),
		useSpinner: true,
		type:Ti.UI.PICKER_TYPE_DATE,
		minDate:new Date(2002, 0, 1),
		maxDate:new Date(2024, 11, 31),
		value:new Date(value.getFullYear(), value.getMonth(), value.getDate())
	});	
	picker.selectionIndicator = true;
	picker.setLocale(Titanium.Platform.locale);
		
	var b2 = Titanium.UI.createButton({
		title:'Search',
		top:70+120*(p_height/480),
		height:40*(p_height/480),
		left:10,
		right:10
	});
	
	var tableData = [];
	var find_table = Titanium.UI.createTableView({
		data:tableData,
		left:10,
		right: 10,
		top:b2.top+40*(p_height/480),
		bottom: 50*(p_height/480)+20
	});	
	
	win.add(b1);
	win.add(b11);
	win.add(picker);
	win.add(b2);
	win.add(find_table);
	
	picker.addEventListener('change',function(e)
	{		
		searchdate=e.value.getFullYear()+"-";
		temp_month=(e.value.getMonth()+1);
		temp_date=e.value.getDate();
		if(temp_month<10)
			searchdate+="0"+temp_month+"-";
		else
			searchdate+=temp_month+"-";
		if(temp_date<10)
			searchdate+="0"+temp_date;
		else
			searchdate+=temp_date;
	});
	
	b1.addEventListener('click', function()
	{
		value = new Date();
		picker.value=new Date(value.getFullYear(), value.getMonth(), value.getDate());
		searchdate=value.getFullYear()+"-";
		temp_month=(value.getMonth()+1);
		temp_date=value.getDate();
		if(temp_month<10)
			searchdate+="0"+temp_month+"-";
		else
			searchdate+=temp_month+"-";
		if(temp_date<10)
			searchdate+="0"+temp_date;
		else
			searchdate+=temp_date;
		b2.fireEvent('click');
	});
	
	b11.addEventListener('click', function()
	{
		searchdate="";
		b2.fireEvent('click');
	});
	
	b2.addEventListener('click', function()
	{		
		var db = Ti.Database.open('cost');
		if(db.execute("SELECT name FROM sqlite_master WHERE type= 'table' AND name =  'cost'").isValidRow()){
			var temp_data=searchdate+'%';
			var rows = db.execute('SELECT product, count(product), sum(price), Inventory FROM cost WHERE time LIKE ? GROUP BY product',temp_data);
			var pos = 0;
			var total_price=0;
			var curr = 0;
			var temp_count;
			var empty_tableData = [];
			tableData=empty_tableData;
			while(rows.isValidRow()){
				tableData.push({
					title: rows.fieldByName('product')+" count "+rows.fieldByName('count(product)')+" with $"+rows.fieldByName('sum(price)')
				});
				if(rows.fieldByName('Inventory')!=null && rows.fieldByName('Inventory')!="NaN")
					tableData[curr].title+=" remain "+rows.fieldByName('Inventory');
				temp_count=parseInt(rows.fieldByName('count(product)'));
				total_price+=parseInt(rows.fieldByName('sum(price)')*100);
				pos+=temp_count;
				curr++;				
				rows.next();
			}
			rows.close();
			if(pos!=0){
				tableData.push({
					title: "There are "+pos+" items with $"+parseFloat(total_price)/100
				});
			}				
			else{
				tableData.push({
					title: "None of data of that date"
				});
			}				
		}
		else{
			tableData.push({
				title: "None of data of that date."
			});
		}			
		find_table.data = tableData;
		picker.fireEvent('change',{value:picker.value});
	});
	
	return win;
};

module.exports = find;