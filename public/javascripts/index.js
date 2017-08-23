$(document).ready(function() {
	var itemInfo = {};
	var selectedItem;

	var criteriaList = ['fat', 'sugar', 'potassium', 'calories'];
	var priorityList = ['High', 'Medium', 'Low'];
	// $('.selectpicker').selectpicker('mobile');

	$('#criteriaTable').on('click', '.glyphicon-remove', function(e) {
		console.log($(this).parents('tr').index());
		$(this).parents('tr').remove();
	});
	$('#add').click(function(e) {
		//e.preventDefault();
		var tr = DOMcreator({name:'tr', classlist:['table-row']}); 
		var td = DOMcreator({name:'td', inner:'<span class="glyphicon glyphicon-remove"></span>'});
		tr.appendChild(td);

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

		td = DOMcreator({name:'td'});
		select = DOMcreator({name:'select', classlist:['form-control','priority']});
		priorityList.forEach(function(p) {
			$(select).append('<option value="'+p+'">'+p+'</option>');
		});
		td.appendChild(select);
		tr.appendChild(td);

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
				var li = document.createElement('li');
				li.classList.add('item');
				var a = document.createElement('a');
				a.innerHTML = item.name;
				li.appendChild(a);
				$(selector).append(li);
				$(li).data('item-info', item);
				// $(selector).append('<li class="item"><a>'+item.name+'</a></li>');
				// itemInfo[item.type].push(item);
			});
		}
		else
			console.log("Error getting data"); 
	}

	function displayInfo(item) {
		$('#info-list').html("");
		for(var key in item) {
			if(item[key] != null || item[key] != '')
				$('#info-list').append('<li>' + key + ': ' + item[key] + '</li>');
		}
		$('#item-info-popup').css('display', 'block');
	}

	$('#item-info-popup').click(function(e) {
		$(this).css('display', 'none');
	});

	$('body').on('click', 'li.item', function(e) {
		//Get item clicked index and corresponding item info
		// var index = $(this).index();
		// var parentID = $(this).parent().attr('id');
		// var info = itemInfo[parentID][index];
		console.log($(this).index());
		console.log($(this).data('item-info'));
		displayInfo($(this).data('item-info'));
	});


	//HELPER FUNCTIONS
	function DOMcreator(req) {
		//req = {name:string, classlist:array, attr:object, inner:string}
		var dom = document.createElement(req.name);
		if(req.classlist) {
			req.classlist.forEach(function(c) {
				dom.classList.add(c);
			});
		}
		if(req.attr) {
			for(var key in req.attr) {
				$(dom).attr(key, req.attr[key]);
			}
		}
		if(req.inner) dom.innerHTML = req.inner;
		return dom;
	}

	$('#get').click(function(e) {
		// console.log("fetching items");
		$.ajax({
			type: 'Get',
			url: '/getItems',
			success: function(data) {
				displayResults(JSON.parse(data));
			}
		});
	});
});
