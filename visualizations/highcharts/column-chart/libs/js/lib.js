(function($){ 
 
 	//Step 1: Store id for view. Should be the same name as the root folder for the view
	var id="column-chart"; 
  	Presto.namespace('Highcharts.view'); 
 
 	//Step 2: Create class name
  	Highcharts.view.ColumnChart = function(selector, dataTable, config) { 
	
	    //Disable Browser console debugging
		Presto.Console(false);

	    config = config || {}; 
	    var me = this;
	    var el = $(selector); 
	    me.config = config;
			    
	    //Step 3: Create markup displayed when the user edits the View.
	    me.showConfig = function(dataTable, selector, config){
	    	
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
			    				'<th colspan="2" class="pluggable-view-config-header">Chart Configuration</th>',
			    			'</tr>',
			    			'<tr class="stacked_chart_section">',
				    			'<td colspan="2" ><div class="stacked_chart_section">Chart Options</div></td>',
				    		'</tr>',
				    		'<tr>',
			    				'<td colspan="2" style="padding:10px;">',
			    					'<table id="stacked_chart_category_table">',
			    						'<tbody>',
	  			    						'<tr>',
			    								'<td>Caption:</td> <td><input type="text" name="chart_caption" /> <span style="color:#990000;">* Required</span></td> ',
			    							'</tr>',
	  			    						'<tr>',
		    								'<td>Subtitle:</td> <td><input type="text" name="chart_subtitle" /></td> ',
		    								'</tr>',
			    							'<tr>',
			    								'<td>X Value:</td> <td> <select name="chart_x_values">'+ options.join('') +'</select></td>',
			    							'</tr>',
			    							'<tr>',
		    								'<td>Series Description:</td> <td> <input type="text" name="chart_y_desc"/></td>',
		    							'</tr>',
			    						'</tbody>',
			    					'</table>',	    					
			    				'</td>',
			    			'</tr>',
			    			'<tr>',
			    			'<td colspan="2"><div class="stacked_chart_section">Series Configuration</div></td>',
			    		'</tr>',
			    		'<tr>',
		    				'<td colspan="2" style="padding:10px;">',
		    					'<div class="stacked_chart_series_container">',
		    					'<table id="stacked_chart_series_table">',
		    						'<tbody></tbody>',
		    					'</table>',	    					
		    					'</div>',
		    				'</td>',
		    			'</tr>',
	    			'</tbody>',
	    		'</table>'
		    	];		    			    	
		    	
		      	me.form = $(selector).html(markup.join(''));

		      	//Re-Populate form if necessary
		      	if(!jQuery.isEmptyObject(props)) {
		      		//Populate select elements
		      		me.form.find('input[name=chart_caption]').val(props.chart_caption);
		      		me.form.find('input[name=chart_subtitle]').val(props.chart_subtitle);
		      		me.form.find('select[name=chart_x_values]').val(props.chart_x_values);		   
		      		me.form.find('input[name=chart_y_desc]').val(props.chart_y_desc);
		      		
		      		me.rowCtr = 0;
		      		var seriesArray = props.stacked_chart_series;		      				      		
		      		seriesArray.each(function(serie, i) {
		      			var removeBtn = (i > 0) ? true: false;		      			
						var row = me.getRow(config, removeBtn);
		      			
		      			$('#stacked_chart_series_table> tbody:last').append(row);   					
		      		});
    		
		      		seriesArray.each(function(serie, i) {
		      			$('#stacked_chart_series_table> tbody').find('select[inputname=stacked_chart_series_'+ (i+1) +']').val(serie.column);
		      			$('#stacked_chart_series_table> tbody').find('input[name=stacked_chart_series_'+ (i+1) +']').val(serie.name);
		      		});
		      	} else {
			   		//Add first series row
					var row = me.getRow(config, false);
					$('#stacked_chart_series_table> tbody:last').append(row);
		      	}
		      	
				/***********************************************
				 * Event Listeners
				 ***********************************************/	      
				//Add events to add series button
				$("#stacked_chart_series_table").delegate(".stacked_chart_series_add","click",function(){
	  				var row = me.getRow(config, true);
					$('#stacked_chart_series_table> tbody:last').append(row);
				});	
				
				//Add events to remove series button
				$("#stacked_chart_series_table").delegate(".stacked_chart_series_remove","click",function(){
					var id = $(this).attr('rowname');
	  				$('#' + id).remove();
				});	
				
				//Add events to series combos
				$("#stacked_chart_series_table").delegate("select","change",function(){
					var  ipt = $(this).attr('inputname');
	  				$("input[name=" + ipt + "]").val($(this).val());
				});	
	    }; 
    
	    //Step 4: Create validation rules for the View Wizard if it applies. 
	    //This method is used by the View Wizard in Presto, if true the View creation process will continue
	    me.validate = function(){ 
	   		var config = me.getConfig(), props;

            if(config){
                props = config.properties;
                return props.chart_caption ? true : false;
            }
            
            return false;	
	    }; 
    
	    //Step 5: Specify from which fields, the view will get its static data
	    me.getConfig = function(){  
	    	var el = me.form,
	    		config = me.config || {};
	    		
	    	if(el) {
	    		config.properties = {
	    			chart_caption : el.find('input[name=chart_caption]').val(),
	    			chart_subtitle : el.find('input[name=chart_subtitle]').val(),
	    			chart_x_values : el.find('select[name=chart_x_values]').val(),
					chart_y_desc : el.find('input[name=chart_y_desc]').val(),
					stacked_chart_series : me.getSeriesValues(el)
	    		}	
	    	}	
	    	
	    	return config;
	    		
	    };
    
	    //Step 6: Create Draw markup. 
	    //This renders the View. This is where view and dynamic data come together
	    me.draw = function(dataTable, config){ 
	    	me.getChart(dataTable, config);	    	
	    }; 
        
	    //Step 7: Create markup to be drawn when data is updated.
	    //Called when the dataTable has been updated
	    me.update = function(dataTable, options){};      
	    
	    /*************************************
	     * User-defined methods
	     *************************************/
	     
	    //Returns series row 
	    me.getRow = function(config, isRemoveBtn) { 
	    	me.rowCtr++;
	    	
	    	var options = ['<option name="0">Select an column</option>'];

	    	config.columns.each(function(col){ 
	  			var name = col.name;
	  			options.push('<option name="'+ 	name +'" >'+ name +'</option>'); 
			});	
			
			var removeBtn = (isRemoveBtn) ? ['<td valign="bottom"><button class="stacked_chart_series_remove" rowname="stacked_chart_series_'+ me.rowCtr +'"> - </button></td>']: '';
      
			var row = [
				'<tr id="stacked_chart_series_'+ me.rowCtr +'">',					
					'<td>',
						'<span>Series Column</span><br/>',
						'<select style="width:150px;" inputname="stacked_chart_series_'+ me.rowCtr +'"  >',
							options.join(''),
						'</select>',
					'</td>',
					'<td>',
						'<span>Series Name</span><br/>',
						'<input type="text" name="stacked_chart_series_'+ me.rowCtr +'" size="30" />',
					'</td>',
					'<td valign="bottom">',
						'<button class="stacked_chart_series_add"> + </button>',
					'</td>',
					removeBtn,					
				'</tr>',
			];
			
			return row.join('');	
		};
		
		//Serializes values from all series row.
		//Returns an array of series metadata objects.
		me.getSeriesValues = function(form) {
			var series = [];
			
			form.find('#stacked_chart_series_table tr').each(function() {
				series.push({
					"name": $(this).find('input').val(),
					"column": $(this).find('select').val() 	
				});		
			});			
			
			return series;
		};
				
		//Returns chart markup with data
		me.getChart = function(dataTable, config) { 
			var columns = config.columns, 
				random = Math.ceil(Math.random() * 999999999) + 3,
	      		rows = Presto.view.getRows(dataTable, config.columns, {"flatten":"true"}),
	      		props = config.properties,
	      		data = [], dataset = [], categories = []; 
			
	    	rows.each(function(row, i){
	        	categories.push(row[props.chart_x_values]);
		    });
	    	
		    props.stacked_chart_series.each(function(series) {
		    	data = [];
		    	rows.each(function(row, i){
		        	data.push(parseInt(row[series.column]));
			    });
		    	
		    	dataset.push({
		    		'name': series.name,
		    		'data': data	
		    	});	
		    });

	      	Highcharts.setOptions({
		       global: {
		         useUTC: false
		       }
		    });
		      
		      return new Highcharts.Chart({            
		          chart: {
			          renderTo: el[0],
			          type: 'column'
		          },
		          title: {
		                text: props.chart_caption
		            },
		            subtitle: {
		                text: props.chart_subtitle
		            },
		            xAxis: {
		                categories: categories
		            },
		            yAxis: {
		                min: 0,
		                title: {
		                    text: props.chart_y_desc
		                }
		            },
		            tooltip: {
		                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		                    '<td style="padding:0"><b>{point.y}</b></td></tr>',
		                footerFormat: '</table>',
		                shared: true,
		                useHTML: true
		            },
		            plotOptions: {
		                column: {
		                    pointPadding: 0.2,
		                    borderWidth: 0
		                }
		            },
		            series: dataset
			});	
		};
  }; 
  
  //Registering the View in Presto
  Presto.view.register({ 
    cls: Highcharts.view.ColumnChart, 
    lib: id 
  }); 
}(jQuery));