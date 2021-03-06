'use strict';
var socket = io("http://sosnovsky.ca/",{
  path: '/vitalist/socket.io'
});
var currentData;

// Wrappers for  socket events
function update(changes) {
	socket.emit('update', changes)
}

function addTodo(newTodo) {
	socket.emit('add', newTodo)
}

function deleteTodo(id) {
	socket.emit('remove', id)
}

// Table Draws
function refresh(dtlist) {
	currentData = dtlist.filter( row => !row.deleted ) ;
	$('.edit-team').hide();$('#add-btn').show();
	refreshTable(d3.select('#table-undone'),{
		main: currentData.filter(function(d){return !d.done}),
		sub	: function(d){
			var rating = d.rating || 0;
			return [
				`
				<span class="list-item">${d.text}</span>
				`,
				`${[...Array(5).keys()].map(i =>`
					<i class="glyphicon glyphicon-${ i <= rating ? 'star' : 'star-empty' } rating-score" rating="${i}"></i>
				`).join('')}`,
				`<span class="mark-btn" done-status="${d.done}">
					<i class="checker glyphicon glyphicon-unchecked"></i>
				</span>`
			];
		},
		status: true
	});
	refreshTable(d3.select('#table-done'),{
		main: currentData.filter(function(d){return d.done}),
		sub	: function(d){
			var rating = d.rating || 0;
			return [
				`
				<span class="list-item is-done">${d.text}</span><br/>
				<p class="list-item date">${moment(d.time_done ? d.time_done : d.last_change).format('MMM-DD/YY')}</p>
				`,
				`${[...Array(5).keys()].map(i =>`
					<i class="glyphicon glyphicon-${ i <= rating ? 'star' : 'star-empty' } rating-score" rating="${i}"></i>
				`).join('')}`,
				'<span class="mark-btn" done-status="'+d.done+'"><i class="checker glyphicon glyphicon-check"></i></span>'
			];
		},
		status: false
	});
	var nDone = currentData.filter(function(d){return d.done}).length;
	var nTodo = currentData.filter(function(d){return !d.done}).length;
	$('#D-list-title').html('Done List <span class="badge badge-lg">' + (nDone) + '</span>');
	$('#U-list-title').html('To do List <span class="badge badge-lg">' + (nTodo) + '</span>');

	$('.mark-btn').on('click',function(e){
		var elm = d3.select(this);
		var id = this.parentElement.parentElement.id;
		var status = !(elm.attr("done-status")==="true");
		
		console.log({
		[id] : {
				done:status
			}
		})
		update({
			[id] : {
				done:status
			}
		});
	});
}

function refreshTable(table, opt) {
	var rows 	= table.selectAll('tr')
	.classed('active',false)
	.style("font-weight","initial")
	// .style("text-decoration",opt.status?"none":"line-through")
	.data(opt.main)
	.attr('id',function(d){
		return d.id;
	})
	.attr('loc',function(d){
		return d.index;
	})

	var cells = rows.attr('id',function(d){
		return d.id;
	}).selectAll('td')
	.data(opt.sub);

	cells.enter().append('td')
	.attr('class', 'enter')
	.transition()
	cells.html(function(d){return d;});

	cells.exit()
	.attr('class', 'exit')
	.transition()
	.remove();

	rows.enter().append('tr')
	// .style("text-decoration",opt.status?"none":"line-through")
	.attr('class','list-item-tr')
	.attr('id',function(d){
		return d.id;
	})
	.attr('loc',function(d){
		return d.index;
	})
	.selectAll('td')
	.data(opt.sub)
	.enter().append('td')
	.html(function(d){
		return d;
	});
	rows.on('mouseleave',function(d){
		if(!d3.select(this).classed('active')){
			d3.select(this).select('.checker').attr('class','checker glyphicon glyphicon-' + (opt.status?'unchecked':'check'));
			d3.select(this).transition().duration(500).style("font-weight","initial");
		}
	}).on('mouseenter',function(d){
		d3.select(this).select('.checker').attr('class','checker glyphicon glyphicon-new-window');
		d3.select(this).transition().duration(500).style("font-weight","bold");
	})
	// .on('click',)
	.style('cursor','pointer');

	d3.selectAll('td').attr('class',(elem, index) => {
		if($(elem).hasClass('list-item')) {
			return 'is-row-head';
		}else if($(elem).hasClass('mark-btn')){
			return 'is-check-mark-head';
		}
	})

	d3.selectAll('.rating-score').on('click', function(){
		update({
			[$(this).parent().parent().attr('id')] : {
				rating: $(this).attr('rating')
			}
		})
	})

	d3.selectAll('.rating-score.glyphicon-star').on('mouseover', function(){
		$(this).removeClass('glyphicon-star').addClass('glyphicon-star-empty')
	})

	d3.selectAll('.rating-score.glyphicon-star').on('mouseleave', function(){
		$(this).addClass('glyphicon-star').removeClass('glyphicon-star-empty')
	})

	d3.selectAll('.rating-score.glyphicon-star-empty').on('mouseleave', function(){
		$(this).removeClass('glyphicon-star').addClass('glyphicon-star-empty')
	})

	d3.selectAll('.rating-score.glyphicon-star-empty').on('mouseenter', function(){
		$(this).addClass('glyphicon-star').removeClass('glyphicon-star-empty')
	})

	d3.selectAll('.is-row-head').on('click',function(){
		d3.selectAll('.list-item-tr')
		.classed('active',false)
		.style("font-weight","initial");

		d3.selectAll('.list-item-tr')
		.select('.checker')
		.attr('class','checker glyphicon glyphicon-unchecked');

		d3.select(this).classed('active',true);					
		$('.edit-team').show();
		$('#add-btn').hide();

		d3.select('#edit-btn').attr('elem-id',d3.select(this.parentElement).attr('id'))
		.attr('elem-index',d3.select(this.parentElement).attr("loc"))
		.attr('elem-not-done',opt.status);

		d3.select('#up-btn')
		.attr('elem-id',(this.parentElement.previousSibling?d3.select(this.parentElement.previousSibling).attr("id"):"NA"))
		.attr('elem-index',(this.parentElement.previousSibling?d3.select(this.parentElement.previousSibling).attr("loc"):"NA"));

		d3.select('#dn-btn')
		.attr('elem-id',(this.parentElement.nextSibling?d3.select(this.parentElement.nextSibling).attr("id"):"NA"))
		.attr('elem-index',(this.parentElement.nextSibling?d3.select(this.parentElement.nextSibling).attr("loc"):"NA"));
		$('#input-text').val(d3.select(this).select('.list-item').text())

	})	

	rows.exit()
	.attr('class', 'exit')
	.remove();
	$('#input-text').val('');
	
};

// Listen to data incoming
socket.on('data', refresh);

// Btn calls
$('#edit-btn').on('click',function(){
	console.log($('#edit-btn').attr("elem-id"))
	update({
		[$('#edit-btn').attr("elem-id")] : {
			text: $('#input-text').val().trim()
		}
	});
});

$('#up-btn').on('click',function(){
	if($('#up-btn').attr('elem-id') === "NA")	{
		alert("Already at the top!");
	}	else 	{
		update({
			[$('#up-btn').attr('elem-id')] : {
				index: $('#edit-btn').attr('elem-index')
			},
			[$('#edit-btn').attr('elem-id')] : {
				index: $('#up-btn').attr('elem-index')
			}
		});
	}
});

$('#dn-btn').on('click',function(){
	if($(this).attr('elem-id') === "NA")	{
		alert("Already at the bottom!");
	}	else 	{
		update({
			[$(this).attr('elem-id')] : {
				index: $('#edit-btn').attr('elem-index')
			},
			[$('#edit-btn').attr('elem-id')] : {
				index: $(this).attr('elem-index')
			}
		});
	}
});

$('#add-btn').on('click',function(){
	if($('#input-text').val() !== '') 	{
		addTodo(
			String($('#input-text').val())
		)
	}	else 	{
		alert("Shmopster, you gotta write something for us to do!");
	}
});

$('#remove-btn').on('click', function(){
	deleteTodo(
		$('#edit-btn').attr('elem-id')
	)
})

$('#refresh-btn').on('click',function(){
	$('.edit-team').hide();
	$('#add-btn').show();
	refresh(currentData)
});

$('#input-text').keypress(function(e){
	if(e.which === 13) {
		if(!$('#edit-btn').css('display') || $('#edit-btn').css('display') === 'none'){
			$('#add-btn').trigger('click')
		}else{
			$('#edit-btn').trigger('click')
		}
	}
})


// var span = $(".modal .close");


// btn.onclick = function() {
//     modal.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = "none";
//     }
// }
