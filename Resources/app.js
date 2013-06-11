var tabGroup = Titanium.UI.createTabGroup();

//..................................................................
var win1 = Titanium.UI.createWindow({
	title:'Search window',
	backgroundColor:"#FFFFFF",
	url: 'win1.js'
});

var tab1 = Titanium.UI.createTab({  
    icon:'/images/KS_nav_ui.png',
    title:'Web',
    window:win1
});
//..................................................................
var win2 = Titanium.UI.createWindow({  
    title:'Insert window',
    backgroundColor:'#fff',
    url: 'win2.js'
});

var tab2 = Titanium.UI.createTab({  
    icon:'/images/KS_nav_ui.png',
    title:'Local',
    window:win2
}); 
//..................................................................
var win3 = Titanium.UI.createWindow({  
    title:'Delete window',
    backgroundColor:'#fff',
    url: 'win3.js'
});

var tab3 = Titanium.UI.createTab({  
    icon:'/images/KS_nav_views.png',
    title:'Synchronous',
    window:win3
});
//..................................................................

tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);

tabGroup.open();