$(document).ready(function() {
	var itemInfo = {};
	var currentItem;
	var selectedItem;

	var criteriaList = ['fat', 'sugar', 'potassium', 'calories'];
	var priorityList = ['High', 'Medium', 'Low'];
	// $('.selectpicker').selectpicker('mobile');

	$('#criteriaTable').on('click', '.glyphicon-remove', function(e) {
		console.log($(this).parents('tr').index());
		$(this).parents('tr').remove();
	});


	$('#add').click(function(e) {
		var tr = DOMcreator({name:'tr', classlist:['table-row']}); 
		//Add remove button
		var td = DOMcreator({name:'td', inner:'<span class="glyphicon glyphicon-remove"></span>'});
		tr.appendChild(td);
		//Add criteria dropdown search
		td = DOMcreator({name:'td'});
		var select = DOMcreator({ name:'select',
			classlist:['form-control','criteria-name', 'selectpicker'], 
			attr:{"data-live-search":true, "data-width":"300px", "title":"potassium, cholestrol, etc..."}
		});
		criteriaList.forEach(function(c) {
			$(select).append('<option value="'+c+'">'+c+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);
		//Add priority dropdown
		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', classlist:['form-control','priority', 'selectpicker']});
		priorityList.forEach(function(p) {
			$(select).append('<option value="'+p+'">'+p+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);
		//Add criteria value
		td = DOMcreator({name:'td', inner:'<input type="number" class="form-control max" value="30"/>'});
		tr.appendChild(td);
		$('.table-row:last').after(tr);
		$(".selectpicker").selectpicker('refresh');

	});
	$('#submit').click(function(e) {
		e.preventDefault();
		var allCriterias = [];
		$('.table-row').each(function(tr) {
			var criteria = {};
			criteria.name = $(this).find('select.criteria-name').val();
			if(criteria.name != ""){
				criteria.priority = $(this).find('.priority').val();
				criteria.max = $(this).find('.max').val();
				allCriterias.push(criteria);
			}
		});
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
	$('body').on('click', 'li.item a', function(e) {
		//Get clicked item info
		console.log($(this).data('item-info'));
		displayInfo($(this).data('item-info'));
	});

	$('#item-info-popup').click(function(e) {
		$(this).css('display', 'none');
	});

	$('#addMealCart').click(function(e) {
		addToMealCart(currentItem);
	});

	$('#mealCart').click(function(e) {
		$('#cartItems').html("");
		var cartItems = $(this).data('items');
		if(cartItems) {
			cartItems.forEach(function(item) {
				$('#cartItems').append('<p>' + item.name + '</p>');
			});
		} else {
			$('#cartItems').html("None");
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
		$('#itemInfoDesc').html("");
		$('#itemInfoImage').html("");
		$('#item-modal-title').text(item.name);
		for(var key in item) {
			if(key == 'name' || key == 'id') continue;
			if(item[key] != 'null' && item[key] != '') {
				$('#itemInfoDesc').append('<p>' + key + ': ' + item[key] + '</p>');
			}
		}
		$('#itemModal').modal('show');
	}

	function addToMealCart(item) {
		var items = $('#mealCart').data('items') || [];
		items.push(item);
		$('#mealCart').data('items', items);
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

});
