(function($){ 
 
  var id="esri-map"; 
  Presto.namespace('ESRI.view'); 
 
  ESRI.view.BasicMap = function(selector, dataTable, config) { 
	
    //Enable Browser console debugging
	Presto.Console(false);
		
    config = config || {}; 
    var self = this;
    var el = $(selector); 
    var esriMap;
    self.config = config; 
    
    
    //Step 3: Create markup displayed when the user edits the View.
    self.showConfig = function(dataTable, selector, config){
    	
    	//populating dropdowns with mashable available columns
    	var options = [],
    		props = config.properties || {};
    		
	    	config.columns.each(function(col){ 
	  			var name = col.name;
	  			options.push('<option name="'+ 	name +'">'+ name +'</option>'); 
			});

	    	var markup = [
	    		'<table border="0" class="pluggable-view-config-tbl">',
	    			'<tbody id="chart-props">',
			    		'<tr>',
    						'<td>Title:</td> <td> <select name="title">'+ options.join('') +'</select></td>',
							'</tr>',
	    						'<tr>',
	    							'<td>Description:</td> <td> <select name="description">'+ options.join('') +'</select></td>',
							'</tr>',
    						'<tr><td colspan="2">',
    						'<div class="fieldset">',
	    						'<div class="field-label-group">',
	    						'<span class="field-label">Select the Coordinates</span>',
	    						'<span class="field-label-hint"> Select attribute(s) to be used as the coordinates</span>',
	    						'</div>',
    						'<div class="mapview-latlon-select well">',
	    						'<div style="margin:8px 0;">',
	    						'<input type="radio" checked="checked" value="lat-lon" name="pointselector">',
	    						'<strong>Latitude: <strong><select name="latitude">'+ options.join('') +'</select>',
	    							' Longitude: <select name="longitude">'+ options.join('') +'</select>',
	    						'</div>',
	    						'<div style="margin:8px 0;">',
		    						'<input type="radio" value="point" name="pointselector">',
									'<strong>Point:</strong> <select name="point">'+ options.join('') +'</select>',
								'</div>',
    						'</div></div>',
    					'</td>',
		    		'</tr>',
    			'</tbody>',
    		'</table>'
	    	];		    			    	
	    	
	      	self.form = $(selector).html(markup.join(''));
	      	//Re-Populate form if necessary
	      	if(!jQuery.isEmptyObject(props)) {
	      		//Populate select elements
	      		self.form.find('select[name=title]').val(props.map_title);
	      		self.form.find('select[name=description]').val(props.map_description);
	      		self.form.find('select[name=latitude]').val(props.map_latitude);		   
	      		self.form.find('select[name=longitude]').val(props.map_longitude);
	      		self.form.find('select[name=point]').val(props.map_point);
            	if (props.map_pointselector === 'lat-lon') {
            		self.form.find('input[value=lat-lon]').attr('checked',true);
            	} else {
            		self.form.find('input[value=point]').attr('checked',true);
            	}
	      	}
    };
    
    //Step 4: Create validation rules for the View Wizard if it applies. 
    //This method is used by the View Wizard in Presto, if true the View creation process will continue
    //self.validate = function(){ 
   	//	var config = self.getConfig(), props;
//
     //   if(config){
     //       props = config.properties;
     //       return props.latitude ? true : false;
     //   }
        
     //   return false;	
    //}; 
    
    //Specify from which fields, the view will get its static data
    self.getConfig = function(){  
    	var el = self.form,
    		config = self.config || {};
    		
    	if(el) {
    		config.properties = {
    			map_title : el.find('select[name=title]').val(),
    			map_description : el.find('select[name=description]').val(),
				map_latitude : el.find('select[name=latitude]').val(),
				map_longitude : el.find('select[name=longitude]').val(),
				map_point : el.find('select[name=point]').val(),
				map_pointselector : el.find('input[name=pointselector]:checked').val()
    		}	
    	}	
    	
    	return config;
    		
    };
    
    //Draw method its the View main method
    self.draw = function(dataTable, config){
    	el.html('<div id="map" class="claro"></div>');

    	dojo.require("esri.map");

    	esriMap=new esri.Map("map",{
			basemap:"topo",
			center:[-98.58306,39.833322],
			zoom:5,
			sliderStyle:"small"
		});  
		
        var column = config.columns, data='',
        rows = Presto.view.getRows(dataTable, column, { flatten: true }),
        props = config.properties;
        
        var selLayer = new esri.layers.GraphicsLayer();
		dojo.connect(esriMap, "onLoad", function() {
	        if(rows && rows.length && column){
	            rows.each(function(row, i){
	            	var n,x,y;
	            	if (props.map_pointselector === 'lat-lon') {
	            		y=row[props.map_latitude];
	            		x=row[props.map_longitude];
	            	} else {
	            		n=row[props.map_point].split(" ");
	            		x=n[1];
	            		y=n[0];
	            	}
	    	    var myPoint = {"geometry":{"x":x,"y":y,
	    	        "spatialReference":{"wkid":4326}},
	    	        "attributes":{	
	    	        "title":row[props.map_title],
	    	        "description":row[props.map_description]},
	    	        "symbol":{
	    	        	"color":[255,0,0,128],
	    	        "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
	    	        "style":"esriSMSSquare",
	    	        "outline":{
	    	        	"color":[0,0,0,255],"width":1,
	    	        "type":"esriSLS","style":"esriSLSSolid"}},
	    	        "infoTemplate":{"title":"${title}","content":"${description}"}};
	    	    var graphic= new esri.Graphic(myPoint);

	    	    esriMap.graphics.add(graphic);
	            }); 
	        }
			});
    };
  }; 
 
  //Registring the View in Presto
  Presto.view.register({ 
    cls: ESRI.view.BasicMap, 
    lib: id
  }); 
}(jQuery));