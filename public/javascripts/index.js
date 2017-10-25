$(document).ready(function() {
	var currentItem;
	var selectedItem;
	var allCriterias = [];
	var criteriaNames = [];
	var dev = {"low" : .2, "medium" : .1, "high" : 0};
	var myCart = 0;
	var criteriaUnits = {
		Calories: 'Cal', Protein: 'g', Fat: 'g', Carbohydrate: 'g', Fiber:'g', Sugar:'g', Calcium:'mg', Iron:'mg', Magnesium:'mg',
		Phosphorus:'mg', Potassium:'mg', Sodium:'mg', Zinc:'mg', VitaminA:'µg', VitaminC:'mg', VitaminB6:'mg', VitaminB12:'µg',
		VitaminD:'µg', VitaminK:'µg', Thiamin:'mg', Riboflavin:'mg', Niacin:'mg', SaturatedFat:'g', MonoUnsaturatedFat:'g', PolyUnsaturatedFat:'g', Cholesterol:'mg', Caffeine:'mg' 
	}

	var ddlCriteriaList = ['fat', 'sugar', 'potassium', 'calories'];
	var priorityList = ['High', 'Medium', 'Low'];
	var rangeTypes = {'lt': 'Less than', 'between': 'Between', 'gt': 'Greater than'};
	// $('.selectpicker').selectpicker('mobile');

	//set the tool bar to the right width of the screen
	var windowWidth = $(window).width();
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		// $('.selectpicker').selectpicker('mobile');
		// $('.selectpicker').selectpicker('refresh');
	} else {
		$('nav').css('width', windowWidth);
	}

	//Attach ddl for criteria names
	for(var key in criteriaUnits) {
		$('.criteria-name').append('<option value="'+key+'">'+key+'</option>');
	}

	//Attach previous cart if exists
	if(sessionStorage.cartItems) {
		var attachCartItems = JSON.parse(sessionStorage.cartItems);
		var i = JSON.parse(sessionStorage.cartItemsNames);
		i.forEach(function(n) {
			addToMealCart(attachCartItems[n], true);
		});
	}

	$('#add').click(function(e) {
		var tr = DOMcreator({name:'tr', classlist:['table-row', 'criteria-row']}); 
		//Add remove button
		var td = DOMcreator({name:'td', inner:'<span class="glyphicon glyphicon-remove"></span>'});
		tr.appendChild(td);
		//Add criteria dropdown search
		td = DOMcreator({name:'td'});
		var select = DOMcreator({ name:'select',
			classlist:['form-control','criteria-name', 'selectpicker'], 
			attr:{"data-live-search":true, "data-width":"200px", "data-size":"10", "title":"fat, sugar, etc..."}
		});
		for(var key in criteriaUnits) {
			$(select).append('<option value="'+key+'">'+key+'</option>');
		}
		td.appendChild(select);
		tr.appendChild(td);
		//Add criteria range type
		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', classlist:['form-control','selectpicker','range-type'],
			attr:{"data-width":"130px"}
		});
		for(var key in rangeTypes) {
			$(select).append('<option value="'+key+'">'+rangeTypes[key]+'</option>');
		}
		td.appendChild(select);
		tr.appendChild(td);
		//Add criteria min
		td = DOMcreator({name:'td', attr:{"data-width":"70px", "nowrap":true}, inner:'<input type="number" class="form-control range1"/><p class="units1">mg</p>'});
		tr.appendChild(td);
		//Add criteria max
		td = DOMcreator({name:'td', attr:{"data-width":"70px", "nowrap":true}, inner:'<input type="number" class="form-control range2" hidden/><p class="units2" hidden="hidden">mg</p>'});
		tr.appendChild(td);
		//Add priority dropdown
		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', attr:{"data-width":"130px"}, classlist:['form-control','priority', 'selectpicker']});
		priorityList.forEach(function(p) {
			$(select).append('<option value="'+p.toLowerCase()+'">'+p+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);
		

		//Add the new row to criteria form and refresh to take changes
		// if($('#criteriaTable .table-row').length == 0) {
		// 	$('#criteriaTable tbody').append(tr);
		// }else {
		$('.table-row:last').after(tr);
		// }
		$(".selectpicker").selectpicker('refresh');

	});
	$('#submit').click(function(e) {
		e.preventDefault();
		allCriterias = [];
		criteriaNames = [];
		$('.criteria-row').each(function(tr) {
			var row = $(this);
			var criteria = {};
			criteria.name = row.find('select.criteria-name').val();
			if(criteria.name != ""){
				var rangeType = row.find('select.range-type').val();
				var priority = row.find('select.priority').val();
				criteria.priority = priority;
				if( row.find('.range1').val() == "" ) {
					alert('One or more of your restriction\'s value is incomplete.');
					return;
				}
				switch(rangeType){
					case 'lt':
						criteria.min = 0;
						criteria.max = parseFloat(row.find('.range1').val());
						break;
					case 'between':
						if( row.find('.range2').val() == "") {
							alert('One or more of your restriction\'s value is incomplete.');
							return;
						}
						criteria.min = parseFloat(row.find('.range1').val());
						criteria.max = parseFloat(row.find('.range2').val());
						if(criteria.min > criteria.max) {
							var temp = criteria.min;
							criteria.min = criteria.max;
							criteria.max = temp;
						}
						break;
					default:
						criteria.min = parseFloat(row.find('.range1').val());
						criteria.max = Infinity;
				}
				allCriterias.push(criteria);
				criteriaNames.push(criteria.name);
			}
		});
		var set = new Set(criteriaNames);
		if(set.size != criteriaNames.length) {
			alert('You have duplicate restrictions. Please remove the duplicate.');
			return;
		}
		var cuisineIdx = $('#cuisine-type').val();
		console.log(allCriterias);
		if(allCriterias.length > 0) { 
			$.ajax({
				type: 'POST',
				url: '/submit',
				data: {data: allCriterias, idx: cuisineIdx},
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

	$('body').on('click', '.card', function(e) {
		//Get clicked item info
		console.log($(this).data('item-info'));
		displayInfo($(this).data('item-info'));
	});

	$('body').on('change', 'select.range-type', function(e) {
		switch($(this).val()) {
			case 'between':
				$(this).parents('tr').find('input.range2').removeAttr('hidden');
				$(this).parents('tr').find('p.units2').removeAttr('hidden');
				break;
			default:
				$(this).parents('tr').find('input.range2').attr('hidden', true);
				$(this).parents('tr').find('p.units2').attr('hidden', true);

		}
	});

	$('body').on('change', 'select.criteria-name', function(e) {
		var val = $(this).val();
		$(this).parents('tr').find('p.units1').html(criteriaUnits[val]);
		$(this).parents('tr').find('p.units2').html(criteriaUnits[val]);
	});
	$('#item-info-popup').click(function(e) {
		$(this).css('display', 'none');
	});

	$('#addMealCart').click(function(e) {
		var count = $('#countToAdd').val();
		if(count == "") {
			alert('Please enter a valid number for How Many to add to MealCart');
			return;
		}else if(parseInt(count) < 0) {
			alert('Please enter a number greater than 0');
			return;
		}else {
			$('#itemModal').modal('hide');
			addToMealCart(currentItem, false);
		}
	});

	$('#mealCart').click(function(e) {
		displayMealCart()
	});

	const Item = ({item}) => `
		<div class="card">
		   <img src="images/${item.type}/${item.imagepath}">
		   <div class="card-block">
		      <h4 class="card-title">${item.name}</h4>
		      <hr><br>
		   </div>
		</div>
	`;

	

	//HELPER FUNCTIONS
	function displayResults(data) {
		if(data.success) {
			console.log(data.result);
			$('.card-group').html('');
			data.result.forEach(function(item, idx) {
				var selector = '#' + item.type + 'List';
				var card = $(Item({item: item}));
				var cardText = card.find('.card-block');
				criteriaNames.forEach(function(criteria) {
					var t = item[criteria.toLowerCase()] || '--';
					cardText.append('<p>' + criteria + ":   " + t + '</p>')
				});
				$(selector).append(card);
				$(card).data('item-info', item);
			});

			$('.tab-pane').each(function(idx) {
				var tab = $(this);
				var numCards = tab.find('.card').length;
				var id = tab.attr('id');
				$('.nav-pills li a[href=#'+id+']').find('.amount').html(' (' + numCards + ')');
				if(numCards == 0) {
					tab.find('.no-matches').show();
				}else {
					tab.find('.no-matches').hide();
				}
			});


			$('#suggestions').removeAttr('hidden');
			$('#notification-results').find('p').html('Found ' + data.result.length + ' matches for your criteria');
			$('#notification-results').fadeIn(500);
			setTimeout(function() {
				$('#notification-results').fadeOut(500);
			}, 3000);


			$('#suggestions a:first').tab('show');
		    $('html, body').animate({
		        scrollTop: $("#suggestions").offset().top - 100
		    }, 1000);
		}
		else{
			console.log(data.error);  
		}
	}

	function displayInfo(item) {
		currentItem = item;
		$('#itemInfoCriteriaDesc').html("");
		// $('#itemInfoDesc').html(""); 
		$('#countToAdd').val(1);
		$('#item-modal-title').text(item.name);
		for(var key in item) {
			if(key == 'name' || key == 'id') continue;
			var selector = '#item' + key.toUpperCase();
			if(item[key] != null) {
				$(selector).html(item[key]);
			}else {
				$(selector).html('--');
			}
		}
		criteriaNames.forEach(function(criteria) {
			var valid = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
			for(var i = 0; i < allCriterias.length; i++) {
				if(allCriterias[i].name == criteria){
					if(item[criteria.toLowerCase()] > allCriterias[i].max || item[criteria.toLowerCase()] < allCriterias[i].min) {
						valid = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i>';
						break;
					}
				}
			}
			var t = item[criteria.toLowerCase()] || '--'
			$('#itemInfoCriteriaDesc').append('<p>' + criteria + ' (' + criteriaUnits[criteria] + '): ' + t + '</p>');
		});
		

		$('#itemModal').modal('show');
		$('#itemModal .modal-body').scrollTop(0);
	}

	function displayMealCart() {
		if(myCart == 0) {
			$('#noItems').show();
			$('#cartNutritionCount').hide();
			$('#cartCriteriaDesc').hide();
			$('#cartTop').hide();
		}
		else {
			$('#noItems').hide();
			$('#cartNutritionCount').show();
			$('#cartCriteriaDesc').show();
			$('#cartTop').show();
			$('#cartCriteriaDesc').html("");

			criteriaNames.forEach(function(name) {
				var selector = '#cart' + name.toUpperCase();
				var total = parseFloat($(selector).html());

				var valid;
				for(var i = 0; i < allCriterias.length; i++) {
					if(allCriterias[i].name == name){
						var mult = dev[allCriterias[i].priority];
						var mi = allCriterias[i].min - allCriterias[i].min * mult;
						var ma = allCriterias[i].max + allCriterias[i].max * mult;
						if(total <= allCriterias[i].max && total >= allCriterias[i].min) {
							valid = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
							break;
						} 
						if(total < ma && total > mi) {
							valid = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i>';
							break;
						} 
						else {
							valid = '<i class="fa fa-times-circle" aria-hidden="true"></i>';
							break;
						}
					}
				}

				$('#cartCriteriaDesc').append('<p>' + name + ': ' + $(selector).html() + ' ' + valid + '</p>');
			});
		}

		$('#cartModal').modal('show');
		$('#cartModal .modal-body').scrollTop(0);
	}
	function addToMealCart(item, onReload) {
		var num = parseInt($('#countToAdd').val());
		for(var i = 0; i < num; i++) {
			var tr = DOMcreator({name:'tr', inner:'<td><i class="glyphicon glyphicon-remove"></i></td><td>' + item.name +'</td>'})
			$(tr).find('i').data('item-info', item);
			$('#cartItems').append(tr);


			for(var key in item) {
				var selector = '#cart' + key.toUpperCase();
				if(isNumeric(item[key]) && item[key] != null) {
					if( isNumeric($(selector).html()) ) {
						var after = parseFloat($(selector).html()) + parseFloat(item[key]);
						$(selector).html(after.toFixed(2));
					} else {
						$(selector).html(item[key]);
					}
				}
			}

			myCart += 1;
			$('#cartQuantity').html(myCart);
			if(!onReload){
				if(sessionStorage.cartItems) {
					var itemsNames = JSON.parse(sessionStorage.cartItemsNames);
					itemsNames.push(item.name);
					sessionStorage.cartItemsNames = JSON.stringify(itemsNames);
					var items = JSON.parse(sessionStorage.cartItems);
					items[item.name] = item;
					sessionStorage.cartItems = JSON.stringify(items);
				} else {
					var itemsNames = [item.name];
					sessionStorage.cartItemsNames = JSON.stringify(itemsNames);
					var items = {};
					items[item.name] = item;
					sessionStorage.cartItems = JSON.stringify(items);
				}
			}
		}
	}

	function removeFromMealCart(item) {
		myCart -= 1;
		$('#cartQuantity').html(myCart);
		if(myCart == 1) {
			var remItem = $('#cartItems').find('tr i').data('item-info');
			for(var key in remItem) {
				var selector = '#cart' + key.toUpperCase();
				if(remItem[key] == null)
					$(selector).html('--');
				else 
					$(selector).html(remItem[key]);
			}
		}else {
			for(var key in item) {
				var selector = '#cart' + key.toUpperCase();
				if(item[key] != null) {
					var after = parseFloat($(selector).html()) - parseFloat(item[key]);
					$(selector).html(after.toFixed(2));
				}
			}
		}
		$('#cartCriteriaDesc').html("");
		criteriaNames.forEach(function(name) {
			var selector = '#cart' + name.toUpperCase();
			var total = parseFloat($(selector).html());

			var valid;
			for(var i = 0; i < allCriterias.length; i++) {
				if(allCriterias[i].name == name){
					var mult = dev[allCriterias[i].priority];
					var mi = allCriterias[i].min - allCriterias[i].min * mult;
					var ma = allCriterias[i].max + allCriterias[i].max * mult;
					if(total <= allCriterias[i].max && total >= allCriterias[i].min) {
						valid = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
						break;
					} 
					if(total < ma && total > mi) {
						valid = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i>';
						break;
					} 
					else {
						valid = '<i class="fa fa-times-circle" aria-hidden="true"></i>';
						break;
					}
				}
			}

			$('#cartCriteriaDesc').append('<p>' + name + ': ' + $(selector).html() + ' ' + valid + '</p>');

		});
		if(myCart == 0) {
			$('#noItems').show();
			$('#cartNutritionCount').hide();
			$('#cartCriteriaDesc').hide();
			$('#cartTop').hide();
		}
		var itemsNames = JSON.parse(sessionStorage.cartItemsNames);
		itemsNames.splice(itemsNames.indexOf(item.name), 1)
		sessionStorage.cartItemsNames = JSON.stringify(itemsNames);
		if(!itemsNames.includes(item.name)) {
			var items = JSON.parse(sessionStorage.cartItems);
			delete items[item.name];
			sessionStorage.cartItems = JSON.stringify(items);
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
