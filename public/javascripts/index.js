$(document).ready(function() {
	var itemInfo = {};
	var currentItem;
	var selectedItem;
	var allCriterias = [];
	var criteriaNames = [];
	var myCart = 0;

	var ddlCriteriaList = ['fat', 'sugar', 'potassium', 'calories'];
	var priorityList = ['High', 'Medium', 'Low'];
	var rangeTypes = {'lt': 'Less than', 'between': 'Between', 'gt': 'Greater than'};
	// $('.selectpicker').selectpicker('mobile');

	//set the tool bar to the right width of the screen
	var windowWidth = $(window).width();
	$('nav').css('width', windowWidth);

	$('#add').click(function(e) {
		var tr = DOMcreator({name:'tr', classlist:['table-row']}); 
		//Add remove button
		var td = DOMcreator({name:'td', inner:'<span class="glyphicon glyphicon-remove"></span>'});
		tr.appendChild(td);
		//Add criteria dropdown search
		td = DOMcreator({name:'td'});
		var select = DOMcreator({ name:'select',
			classlist:['form-control','criteria-name', 'selectpicker'], 
			attr:{"data-live-search":true, "data-width":"100%", "title":"potassium, cholestrol, etc..."}
		});
		ddlCriteriaList.forEach(function(c) {
			$(select).append('<option value="'+c+'">'+c+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);
		//Add criteria range type
		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', classlist:['form-control','selectpicker','range-type']});
		for(var key in rangeTypes) {
			$(select).append('<option value="'+key+'">'+rangeTypes[key]+'</option>');
		}
		td.appendChild(select);
		tr.appendChild(td);
		//Add criteria min
		td = DOMcreator({name:'td', inner:'<input type="number" class="form-control range1"/>'});
		tr.appendChild(td);
		//Add criteria max
		td = DOMcreator({name:'td', inner:'<input type="number" class="form-control range2" hidden/>'});
		tr.appendChild(td);
		//Add priority dropdown
		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', classlist:['form-control','priority', 'selectpicker']});
		priorityList.forEach(function(p) {
			$(select).append('<option value="'+p.toLowerCase()+'">'+p+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);
		

		//Add the new row to criteria form and refresh to take changes
		$('.table-row:last').after(tr);
		$(".selectpicker").selectpicker('refresh');

	});
	$('#submit').click(function(e) {
		e.preventDefault();
		allCriterias = [];
		criteriaNames = [];
		$('.table-row').each(function(tr) {
			var row = $(this);
			var criteria = {};
			criteria.name = row.find('select.criteria-name').val();
			if(criteria.name != ""){
				var rangeType = row.find('select.range-type').val();
				var priority = row.find('select.priority').val();
				criteria.priority = priority;
				switch(rangeType){
					case 'lt':
						criteria.min = 0;
						criteria.max = parseInt(row.find('.range1').val());
						break;
					case 'between':
						criteria.min = parseInt(row.find('.range1').val());
						criteria.max = parseInt(row.find('.range2').val());
						if(criteria.min > criteria.max) {
							var temp = criteria.min;
							criteria.min = criteria.max;
							criteria.max = temp;
						}
						break;
					default:
						criteria.min = parseInt(row.find('.range1').val());
						criteria.max = Infinity;
				}
				allCriterias.push(criteria);
				criteriaNames.push(criteria.name);
			}
		});
		console.log(allCriterias);
		if(allCriterias.length > 0) { 
			$.ajax({
				type: 'POST',
				url: '/submit',
				data: {data: allCriterias},
	            success: function(data) {
	            	displayResults(JSON.parse(data));
	            }
			});
		}
		
	});

	$('#criteriaTable').on('click', '.glyphicon-remove', function(e) {
		console.log($(this).parents('tr').index());
		var name = $(this).parents('tr').find('select.criteria-name').val();
		if(criteriaNames.includes(name)) {
			criteriaNames.splice(criteriaNames.indexOf(name), 1);
		}
		$(this).parents('tr').remove();
	});

	$('#cartItems').on('click', '.glyphicon-remove', function(e) {
		var item = $(this).data('item-info');
		console.log(item);
		$(this).parents('tr').remove();
		removeFromMealCart(item);
	});
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		// $('.selectpicker').selectpicker('mobile');
		$('.selectpicker').selectpicker('refresh');
	}
	$('body').on('click', 'li.item a', function(e) {
		//Get clicked item info
		console.log($(this).data('item-info'));
		displayInfo($(this).data('item-info'));
	});

	$('body').on('change', 'select.range-type', function(e) {
		switch($(this).val()) {
			case 'between':
				$(this).parents('tr').find('input.range2').removeAttr('hidden');
				break;
			default:
				$(this).parents('tr').find('input.range2').attr('hidden', true);

		}
	});

	$('#item-info-popup').click(function(e) {
		$(this).css('display', 'none');
	});

	$('#addMealCart').click(function(e) {
		addToMealCart(currentItem);
	});

	$('#mealCart').click(function(e) {
		if(myCart == 0) {
			$('#noItems').show();
			$('#cartNutritionCount').hide();
			$('#cartCriteriaDesc').hide();
		}
		else {
			$('#noItems').hide();
			$('#cartNutritionCount').show();
			$('#cartCriteriaDesc').show();
			$('#cartCriteriaDesc').html("");
			criteriaNames.forEach(function(name) {
				var selector = '#cart' + name.toUpperCase();
				$('#cartCriteriaDesc').append('<p>' + name + ': ' + $(selector).html() + '</p>');
			});
		}
		$('#cartModal').modal('show');
	});



	//HELPER FUNCTIONS
	function displayResults(data) {
		if(data.success) {
			itemInfo = {
				meal: [],
				vegetable: [],
				fruit: [],
				beverage: []
			};
			console.log(data.result);
			$('.items-list').html('');
			data.result.forEach(function(item, idx) {
				var selector = '#' + item.type;
				var li = DOMcreator({name:'li', classlist:['item']});
				var a = DOMcreator({name:'a', inner:item.name});
				li.appendChild(a);
				$(selector).append(li);
				$(a).data('item-info', item);
			});
		}
		else
			console.log("Server:Error getting data"); 
	}

	function displayInfo(item) {
		currentItem = item;
		$('#itemInfoCriteriaDesc').html("");
		$('#itemInfoDesc').html("");
		$('#itemInfoImage').html("");
		$('#item-modal-title').text(item.name);
		for(var key in item) {
			if(key == 'name' || key == 'id') continue;
			if(item[key] != 'null' && item[key] != '') {
				
				$('#itemInfoDesc').append('<p>' + key + ': ' + item[key] + '</p>');
			}
		}
		criteriaNames.forEach(function(key) {
			$('#itemInfoCriteriaDesc').append('<p>' + key + ': ' + item[key] + '</p>');
		});
		
		$('#itemModal').modal('show');
	}

	function addToMealCart(item) {
		var tr = DOMcreator({name:'tr', inner:'<td class="glyphicon glyphicon-remove"></td><td>' + item.name +'</td>'})
		// $('#cartItems').append('<p>' + item.name + '</p>');
		$(tr).find('td:first').data('item-info', item);
		$('#cartItems').append(tr);

		for(var key in item) {
			var selector = '#cart' + key.toUpperCase();
			if($(selector).html() && isNumeric($(selector).html())) {
				if(isNumeric(item[key])) {
					var after = parseInt($(selector).html()) + parseInt(item[key]);
					$(selector).html(after);
				}
			}else {
				$(selector).html(item[key]);
			}
		}
		// $('#cartCriteriaDesc').html("");
		// criteriaNames.forEach(function(name) {
		// 	var selector = '#cart' + name.toUpperCase();
		// 	$('#cartCriteriaDesc').append('<p>' + name + ': ' + $(selector).html() + '</p>');
		// });
		myCart += 1;
	}

	function removeFromMealCart(item) {
		myCart -= 1;
		if(myCart == 1) {
			var remItem = $('#cartItems').find('tr td:first').data('item-info');
			for(var key in remItem) {
				var selector = '#cart' + key.toUpperCase();
				$(selector).html(remItem[key]);
			}
		}else {
			for(var key in item) {
				var selector = '#cart' + key.toUpperCase();
				if($(selector).html() && isNumeric($(selector).html()) && isNumeric(item[key])) {
					var after = parseInt($(selector).html()) - parseInt(item[key]);
					$(selector).html(after);
				}
			}
		}
		$('#cartCriteriaDesc').html("");
		criteriaNames.forEach(function(name) {
			var selector = '#cart' + name.toUpperCase();
			$('#cartCriteriaDesc').append('<p>' + name + ': ' + $(selector).html() + '</p>');
		});
		if(myCart == 0) {
			$('#noItems').show();
			$('#cartNutritionCount').hide();
			$('#cartCriteriaDesc').hide();
		}
	}

	function DOMcreator(req) {
		//req = {name:string, classlist:array, attr:object, inner:string}
		var dom = document.createElement(req.name);
		if(req.classlist) {
			req.classlist.forEach(function(c) {
				dom.classList.add(c);
			});
		}
		if(req.attr) {
			for(var key in req.attr) $(dom).attr(key, req.attr[key]);
		}
		if(req.inner) dom.innerHTML = req.inner;
		return dom;
	}

	function isNumeric(arg) {
		return !isNaN(arg);
	}

});

$(window).resize(function() {
	var windowWidth = $(window).width();
	$('nav').css('width', windowWidth);

});
