$(document).ready(function() {
	$('#add').click(function(e) {
		//e.preventDefault();
		var tr = document.createElement('tr');
		tr.classList.add('table-row');
		var td = document.createElement('td');
		var input = document.createElement('input');
		input.classList.add('form-control','criteria-name');
		td.appendChild(input);
		tr.appendChild(td);

		td = document.createElement('td');
		var select = document.createElement('select');
		select.classList.add('form-control','priority');
		td.appendChild(select);
		tr.appendChild(td);
		$('.table-row:last').after(tr);


	});
	$('#submit').click(function(e) {
		e.preventDefault();
		var allCriterias = [];
		$('.table-row').each(function(tr) {
			var criteria = {};
			criteria.name = $(this).find('.criteria-name').val();
			criteria.priority = $(this).find('.priority').val();
			allCriterias.push(criteria);
		});
		$.ajax({
			type: 'POST',
			url: '/submit',
			data: {data: allCriterias},
            success: function(data) {
            	if(data)
                	console.log(data);
            }
		});
	});

	$('#get').click(function(e) {
		// console.log("fetching items");
		$.ajax({
			type: 'Get',
			url: '/getItems',
			success: function(data) {
				display(JSON.parse(data));
			}
		});
	});

	function display(data) {
		console.log(data.result); 
	}
});
