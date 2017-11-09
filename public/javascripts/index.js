$(document).ready(function() {
	var currentItem;
	var selectedItem;
	var allCriterias = [[],[]];
	var criteriaNames = [[],[]];
	var displayedSearchTypeIdx = 0;
	var dev = {"low" : 0, "medium" : .1, "high" : .2};
	var criteriaUnits = {
		Calories: 'Cal', Protein: 'g', Fat: 'g', Carbohydrate: 'g', Fiber:'g', Sugar:'g', Calcium:'mg', Iron:'mg', Magnesium:'mg',
		Phosphorus:'mg', Potassium:'mg', Sodium:'mg', Zinc:'mg', VitaminA:'µg', VitaminC:'mg', VitaminB6:'mg', VitaminB12:'µg',
		VitaminD:'µg', VitaminK:'µg', Thiamin:'mg', Riboflavin:'mg', Niacin:'mg', SaturatedFat:'g', MonoUnsaturatedFat:'g', PolyUnsaturatedFat:'g', Cholesterol:'mg', Caffeine:'mg' 
	}

	var ddlCriteriaList = ['fat', 'sugar', 'potassium', 'calories'];
	var priorityList = ['Low', 'Medium', 'High'];
	var rangeTypes = {'lt': 'Less than', 'between': 'Between', 'gt': 'Greater than'}; 
	// $('.selectpicker').selectpicker('mobile');

	//Set the tool bar to the right width of the screen
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


	//Update Cart Count
	countCart();

	//Tutorial event handling
	$('#how-it-works').click(function(e) {
		$('#tutorial').fadeIn(800);
	});
	$('#closeTutorial, #tutorial .fa').click(function(e) {
		$('#tutorial').fadeOut(800);
	});
	$('#splashContainer button').click(function(e) {
		$('.blurBG').fadeOut(500);
		$('#splashContainer').fadeOut(500);
		$('.main').fadeIn(1000);
	});

	$('#add').click(function(e) {
		var tr = DOMcreator({name:'tr', classlist:['table-row', 'criteria-row']}); 
		//Add remove button
		var td = DOMcreator({name:'td', inner:'<span class="glyphicon glyphicon-remove"></span>'});
		tr.appendChild(td);
		//Add criteria dropdown search
		td = DOMcreator({name:'td'});
		var select = DOMcreator({ name:'select',
			classlist:['form-control','criteria-name', 'selectpicker'], 
			attr:{"data-live-search":true, "data-width":"200px", "data-size":"7", "title":"Fat, Sugar, etc..."}
		});
		for(var key in criteriaUnits) {
			$(select).append('<option value="'+key+'">'+key+'</option>');
		}
		td.appendChild(select);
		tr.appendChild(td);
		//Add criteria range type
		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', classlist:['form-control','selectpicker','range-type'],
			attr:{"data-width":"200px"}
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
		select = DOMcreator({name:'select', attr:{"data-width":"200px"}, classlist:['form-control','priority', 'selectpicker']});
		priorityList.forEach(function(p) {
			$(select).append('<option value="'+p.toLowerCase()+'">'+p+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);
		

		//Add the new row to criteria form and refresh to take changes

		var searchType = $('#searchType .active a').attr('href');
		$(searchType).find('.table-row:last').after(tr);
		$(".selectpicker").selectpicker('refresh');

	});
	$('#submit').click(function(e) {
		e.preventDefault();
		var searchType = $('#searchType .active a').attr('href');
		if(searchType == '#mealPlan') var searchTypeIdx = 0;
		else var searchTypeIdx = 1;
		allCriterias[searchTypeIdx] = [];
		criteriaNames[searchTypeIdx] = [];
		var incomplete = false;
		$(searchType+' .criteria-row').each(function(tr) {
			var row = $(this);
			var criteria = {};
			criteria.name = row.find('select.criteria-name').val();
			if(criteria.name != ""){
				var rangeType = row.find('select.range-type').val();
				var priority = row.find('select.priority').val();
				criteria.priority = priority;
				if( row.find('.range1').val() == "" ) {
					incomplete = true;
				}
				switch(rangeType){
					case 'lt':
						criteria.min = 0;
						criteria.max = parseFloat(row.find('.range1').val());
						break;
					case 'between':
						if( row.find('.range2').val() == "") {
							incomplete = true;
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
				allCriterias[searchTypeIdx].push(criteria);
				criteriaNames[searchTypeIdx].push(criteria.name);
			}
		});
		var set = new Set(criteriaNames[searchTypeIdx]);
		if(set.size == 0) {
			alert('No Requirements Set. Please select at least one requirement from the drop down list.');
			return;
		}
		if(set.size != criteriaNames[searchTypeIdx].length) {
			allCriterias[searchTypeIdx] = [];
			criteriaNames[searchTypeIdx] = [];
			alert('You have duplicate requirements. Please remove the duplicate.');
			return;
		}
		if( incomplete ) {
			allCriterias[searchTypeIdx] = [];
			criteriaNames[searchTypeIdx] = [];
			alert('One or more of your requirements\'s value is incomplete.');
			return;
		}
		var cuisineIdx = $('#cuisine-type').val();
		console.log(allCriterias[searchTypeIdx]);
		if(allCriterias[searchTypeIdx].length > 0) { 
			$.ajax({
				type: 'POST',
				url: '/submit',
				data: {data: allCriterias[searchTypeIdx], idx: cuisineIdx, searchTypeIdx: searchTypeIdx},
	            success: function(data) {
	            	displayResults(JSON.parse(data));
	            }
			});
		}
		
	});

	//EVENT HANDLING
	$('#viewAll').click(function(e) {
		$.ajax({
			type: 'GET',
			url: '/viewAll',
            success: function(data) {
            	displayResults(JSON.parse(data));
            }
		});
	});
	//remove restriction
	$('#criteriaMealTable, #criteriaItemTable').on('click', '.glyphicon-remove', function(e) {
		console.log($(this).parents('tr').index());
		var name = $(this).parents('tr').find('select.criteria-name').val();
		var idx = ($('#searchType .active a').attr('href') == '#mealPlan') ? 0 : 1;
		if(criteriaNames[idx].includes(name)) {
			criteriaNames[idx].splice(criteriaNames[idx].indexOf(name), 1);
		}
		$(this).parents('tr').remove();
	});
	//remove cart item
	$('#cartItems').on('click', '.glyphicon-remove', function(e) {
		var item = $(this).data('item-info');
		console.log(item);
		$(this).parents('tr').remove();
		removeFromMealCart(item.id);
	});
	//Click on card
	$('body').on('click', '.card', function(e) {
		//Get clicked item info
		console.log($(this).data('item-info'));
		displayInfo($(this).data('item-info'));
	});
	//lt, gt, or between
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
	//Change units for input
	$('body').on('change', 'select.criteria-name', function(e) {
		var val = $(this).val();
		$(this).parents('tr').find('p.units1').html(criteriaUnits[val]);
		$(this).parents('tr').find('p.units2').html(criteriaUnits[val]);
	});
	//Add item to Cart
	$('#addMealCart').click(function(e) {
		var count = $('#countToAdd').val();
		if(count == "") {
			alert('Please enter a valid number for How Many to add to MealCart');
			return;
		}else if(parseInt(count) <= 0) {
			alert('Please enter a number greater than 0');
			return;
		}else {
			$('#itemModal').modal('hide');
			currentItem.numServ = parseFloat(count).toFixed(1);
			addToMealCart(currentItem);
		}
	});
	//Show Cart
	$('#mealCart').click(function(e) {
		displayMealCart()
	});
	//Update Servings for cart items
	$('#updateServBtn').click(function(e) {
		updateCartServings();
	})
	//Cart Item on hover desc
	$(document).on('mouseenter', '.n', function(e) {
		var row = $(this);
		var itemData = row.parents('tr').find('i').data('item-info');
		$('#itemOnHoverDesc').html('');
		$('#itemOnHoverDesc').append('<p style="color:darkorange;margin-bottom:0px;">Serving Size: ' + itemData.servingsize +'</p>');
		$('#itemOnHoverDesc').append('<p style="color:darkorange;margin-top:0px;"># of Serv: ' + itemData.numServ +'</p>');
		if(criteriaNames[0].length > 0) {
			criteriaNames[0].forEach(function(name) {
				var amt = itemData[name.toLowerCase()] * parseFloat(itemData.numServ);
				$('#itemOnHoverDesc').append('<p>' + name + ': ' + amt.toFixed(2) +'</p>');
			})
		}
		$('#itemOnHoverDesc').css('display', 'block');
	});
	$(document).on('mouseleave', '.n', function(e) {
		$('#itemOnHoverDesc').css('display', 'none');
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
			displayedSearchTypeIdx = data.searchTypeIdx;
			data.result.forEach(function(item, idx) {
				var selector = '#' + item.type + 'List';
				var card = $(Item({item: item}));
				var cardText = card.find('.card-block');
				if(displayedSearchTypeIdx < 2) {
					criteriaNames[data.searchTypeIdx].forEach(function(criteria) {
						var t = item[criteria.toLowerCase()] || '--';
						cardText.append('<p>' + criteria + ":   " + t + '</p>')
					});
				}
				
				$(selector).append(card);
				$(card).data('item-info', item);
			});

			$('#suggestions .tab-pane').each(function(idx) {
				var tab = $(this);
				var numCards = tab.find('.card').length;
				var id = tab.attr('id');
				$('#suggestions .nav-pills li a[href=#'+id+']').find('.amount').html(' (' + numCards + ')');
				if(numCards == 0) {
					tab.find('.no-matches').show();
				}else {
					tab.find('.no-matches').hide();
				}
			});


			$('#suggestions').removeAttr('hidden');
			$('#notification-results').find('p').html('Found ' + data.result.length + ' matches for your restrictions');
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
		$('#countToAdd').val(1);
		$('#item-modal-title').text(item.name);

		//Get Ingredients if any
		$.ajax({
			type: 'POST',
			url: '/getIngredients/'+item.ndbno,
			success: function(data) {
				data = JSON.parse(data);
				if(data.success) {
					$('#itemIng').html(data.ing);
				}else {
					console.log(data.error);
				}
			}
		});
		for(var key in item) {
			if(key == 'name' || key == 'id') continue;
			var selector = '#item' + key.toUpperCase();
			if(item[key] != null) {
				$(selector).html(item[key]);
			}else {
				$(selector).html('--');
			}
		}
		if(displayedSearchTypeIdx < 2) {
			criteriaNames[displayedSearchTypeIdx].forEach(function(criteria) {
				var valid = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
				for(var i = 0; i < allCriterias[displayedSearchTypeIdx].length; i++) {
					if(allCriterias[displayedSearchTypeIdx][i].name == criteria){
						if(item[criteria.toLowerCase()] > allCriterias[displayedSearchTypeIdx][i].max || item[criteria.toLowerCase()] < allCriterias[displayedSearchTypeIdx][i].min) {
							valid = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i>';
							break;
						}
					}
				}
				var t = item[criteria.toLowerCase()] || '--'
				$('#itemInfoCriteriaDesc').append('<p>' + criteria + ' (' + criteriaUnits[criteria] + '): ' + t + '</p>');
			});
		} else {
			$('#itemInfoCriteriaDesc').append('<p>None</p>');
		}
		

		$('#itemModal').modal('show');
		$('#itemModal .modal-body').scrollTop(0);
	}

	function displayMealCart() {
		if(countCart() == 0) {
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

			refreshCartModalItems();
			computeMealCartTotal();

		}

		$('#cartModal').modal('show');
		$('#cartModal .modal-body').scrollTop(0);
	}

	function addToMealCart(item) {
		var cartItems = sessionStorage.cartItems || "{}";
		cartItems = JSON.parse(cartItems);
		//ss and SS == serving size
		if(cartItems[item.id]) {
			var numServ = parseFloat(cartItems[item.id].numServ) + parseFloat(item.numServ);
			cartItems[item.id].numServ = numServ;
		} else {
			cartItems[item.id] = item;
		}
		sessionStorage.cartItems = JSON.stringify(cartItems);
		$('#modalNotifyMsg').html(item.name + '<br> added to MealCart.');
		$('#notification-modal-events').fadeIn(300);
		setTimeout(function() {
			$('#notification-modal-events').fadeOut(300);
		}, 1500);
		$('#cartQuantity').html(countCart());
	}

	function removeFromMealCart(itemID) {
		if(sessionStorage.cartItems) {
			itemID = itemID + '';
			var cart = JSON.parse(sessionStorage.cartItems);
			delete cart[itemID];
			sessionStorage.cartItems = JSON.stringify(cart);
		}
		$('#cartQuantity').html(countCart());
		if(countCart() == 0) {
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
		}
		computeMealCartTotal();
	}

	function updateCartServings() {
		var updated = true;
		$('.cart-item').each(function(row) {
			row = $(this);
			var id = row.find('i').data('item-info').id; 
			var numServ = parseFloat(row.find('input').val()).toFixed(1);
			if(!isNumeric(numServ)) {
				updated = false;
				alert('Please Enter a Valid Number For Servings');
				return false;
			}
			if(numServ < 0) {
				updated = false;
				alert('Please Enter a Non-Negative Number For Servings');
				return false;
			}
			row.find('input').val(numServ)
			if(sessionStorage.cartItems) {
				var items = JSON.parse(sessionStorage.cartItems);
				items[id].numServ = numServ;
				sessionStorage.cartItems = JSON.stringify(items);
			}
			var newItemData = row.find('i').data('item-info');
			newItemData.numServ = numServ;
			row.find('i').data('item-info', newItemData);
		});
		if(updated) {
			$('#modalNotifyMsg').html('Updated Servings in MealCart');
			$('#notification-modal-events').fadeIn(300);
			setTimeout(function() {
				$('#notification-modal-events').fadeOut(300);
			}, 1500);
		}

		computeMealCartTotal();
	}

	function computeMealCartTotal() {
		if(sessionStorage.cartItems) {
			count = {};
			var cartItems = JSON.parse(sessionStorage.cartItems);
			for(var id in cartItems) {
				var item = cartItems[id];
				for(var nutr in item) {
					if(isNumeric(item[nutr]) && item[nutr] != null) {
						var toAdd = parseFloat(item[nutr]) * parseFloat(item.numServ);
						var tot = (count[nutr] || 0) + toAdd;
						count[nutr] = parseFloat(tot.toFixed(2));
					} else {
						count[nutr] = count[nutr] || null;
					}
				}
			}
			for (var nutr in count) {
				var selector = '#cart' + nutr.toUpperCase();
				var val = '--';
				if(count[nutr] != null) val = count[nutr];
				$(selector).html(val);
			}
			$('#cartCriteriaDesc').html("");
			criteriaNames[0].forEach(function(name) {
				var selector = '#cart' + name.toUpperCase();
				var total = $(selector).html();

				var valid;
				for(var i = 0; i < allCriterias[0].length; i++) {
					if(allCriterias[0][i].name == name){
						var mult = dev[allCriterias[0][i].priority];
						var mi = allCriterias[0][i].min - allCriterias[0][i].min * mult;
						var ma = allCriterias[0][i].max + allCriterias[0][i].max * mult;
						if(total <= allCriterias[0][i].max && total >= allCriterias[0][i].min) {
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
	}

	function refreshCartModalItems() {
		if(sessionStorage.cartItems) {
			var items = JSON.parse(sessionStorage.cartItems);
			$('#cartItems').html('');
			for(var id in items) {
				var item = items[id];
				tr = DOMcreator({name:'tr', classlist:['cart-item'],
					inner:'<td><i class="glyphicon glyphicon-remove"></i></td><td><input type="number" class="form-control" value='+parseFloat(item.numServ).toFixed(1)+'></td><td class="n">' + item.name +'</td>'})
				$(tr).find('i').data('item-info', item);
				$('#cartItems').append(tr);
			}
		}
	}

	function countCart() {
		if(sessionStorage.cartItems) {
			var num = 0;
			for(var key in JSON.parse(sessionStorage.cartItems)) {
				num += 1;
			}
			$('#cartQuantity').html(num);
			return num;
		}
		return 0;
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
