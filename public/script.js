var URL = 'db/';

$.ajax({
	type: "GET",
	url: URL+ "get",
	success: function(data) {
		function update(changes,cb) {
			$.post(URL + 'update',changes)
				.done(function(data){
					refresh(data.data);
					if(cb) { cb(false)};
				}).fail(function(err){
					if(cb) { cb(err)};
				})
		}

		function refresh(dtlist) {
			data.data = dtlist;
			$('.edit-team').hide();$('#add-btn').show();
			refreshTable(d3.select('#table-undone'),{
				main: dtlist.filter(function(d){return !d.done}),
				sub	: function(d){
					return ['<span class="list-item">' + d.text + '</span>','<span class="mark-btn" done-status="'+d.done+'"><i class="checker glyphicon glyphicon-unchecked"></i></span>'];
				},
				status: true
			});
			refreshTable(d3.select('#table-done'),{
				main: dtlist.filter(function(d){return d.done}),
				sub	: function(d){
					return ['<span class="list-item">' + d.text + '</span>','<span class="mark-btn" done-status="'+d.done+'"><i class="checker glyphicon glyphicon-check"></i></span>'];
				},
				status: false
			});
			var nDone = dtlist.filter(function(d){return d.done}).length;
			var nTodo = dtlist.filter(function(d){return !d.done}).length;
			$('#D-list-title').html('Done List <span class="badge badge-lg">' + (nDone) + '</span>');
			$('#U-list-title').html('To do List <span class="badge badge-lg">' + (nTodo) + '</span>');
			
			//Mark
			$('.mark-btn').on('click',function(){
				var ret = {}, status = !(d3.select(this).attr("done-status")==="true");
					ret[this.parentElement.parentElement.id] = {done:status};
					
				update(ret,function(err){
					if(err) {
						alert("Oh oh, there was a problem updating!");
						console.error(err);
					}	else 	{
						if(status) alert("I bet it was awesome!");
						if(!status) alert("Can\'t wait to do it again!");
					}
				});
				$('#refresh-btn').trigger('click');
			});
		}
		function refreshTable(table, opt) {
			var rows 	= table.selectAll('tr')
					.classed('active',false)
					.style("font-weight","initial")
					.style("text-decoration",opt.status?"none":"line-through")
					.data(opt.main)
					.attr('id',function(d){
						return d.id;
					})
					.attr('loc',function(d){
						return d.index;
					})

			/*Update*/
			var cells = rows.attr('id',function(d){
							return d.id;
						}).selectAll('td').data(opt.sub);
				
				cells.enter().append('td')
					.attr('class', 'enter')
					.transition()
					cells.html(function(d){return d;});
				
				cells.exit()
					.attr('class', 'exit')
					.transition()
					.remove();

			/*Add new*/
			rows.enter().append('tr')
				.style("text-decoration",opt.status?"none":"line-through")
				.attr('id',function(d){
					return d.id;
				})
				.attr('loc',function(d){
					return d.index;
				})
				.selectAll('td')
				.data(opt.sub)
				.enter().append('td')
				.html(function(d){return d;});
			rows.on('mouseleave',function(d){
					if(!d3.select(this).classed('active')){
						d3.select(this).select('.checker').attr('class','checker glyphicon glyphicon-' + (opt.status?'unchecked':'check'));
						d3.select(this).transition().duration(500).style("font-weight","initial");
					}
				}).on('mouseenter',function(d){
					d3.select(this).select('.checker').attr('class','checker glyphicon glyphicon-new-window');
					d3.select(this).transition().duration(500).style("font-weight","bold");
				}).on('click',function(d){
					refresh(data.data);
					d3.select(this).classed('active',true);					
					$('.edit-team').show();$('#add-btn').hide();
					
					d3.select('#edit-btn').attr('elem-id',d3.select(this).attr('id'))
						.attr('elem-index',d3.select(this).attr("loc"))
						.attr('elem-not-done',opt.status);

					d3.select('#up-btn')
						.attr('elem-id',(this.previousSibling?d3.select(this.previousSibling).attr("id"):"NA"))
						.attr('elem-index',(this.previousSibling?d3.select(this.previousSibling).attr("loc"):"NA"));

					d3.select('#dn-btn')
						.attr('elem-id',(this.nextSibling?d3.select(this.nextSibling).attr("id"):"NA"))
						.attr('elem-index',(this.nextSibling?d3.select(this.nextSibling).attr("loc"):"NA"));

					$('#input-text').val(d3.select(this).select('.list-item').text())
					
				}).style('cursor','pointer');

			/*Delete Old*/
			rows.exit()
				.attr('class', 'exit')
				.remove();
			$('#input-text').val('');
		};

		/*Buttons*/
		//Add
		$('#add-btn').on('click',function(){
			if($('#input-text').val() !== '') 	{
				$.post(URL+'add',{entry:String($('#input-text').val())})
				.done(function(data){
					refresh(data.data);
					alert('Can\'t wait to do `' + $('#input-text').val() +'` with you!');
				})
				.fail(function(err){
					console.error(err);
					alert('Oh oh, something went wrong!');
				});
			}	else 	{alert("Shmopster, you gotta write something for us to do!");}
			$('#refresh-btn').trigger('click');
		});
		//Reset
		$('#refresh-btn').on('click',function(){
			$('.edit-team').hide();
			$('#add-btn').show();
			refresh(data.data);
		});
		//Edit
		$('#edit-btn').on('click',function(){
			var ret = {};
				ret[$(this).attr("elem-id")] = {text:$('#input-text').val()};
			update(ret,function(err){
				if(!err) 	{
					alert('Updated!')
				}	else 	{
					alert("Oh no, there was an issue...");
					console.error(err);
				}
				$('#refresh-btn').trigger('click');
			});
		});

		//Up-btn
		$('#up-btn').on('click',function(){
			if($(this).attr('elem-id') === "NA")	{
				alert("Already at the top!");
			}	else 	{
				var ret = {};
					ret[$(this).attr('elem-id')] = {index: $('#edit-btn').attr('elem-index')}
					ret[$('#edit-btn').attr('elem-id')] = {index: $(this).attr('elem-index')}
				console.log(ret);
				update(ret);
			}
		});

		//Down-btn
		$('#dn-btn').on('click',function(){
			if($(this).attr('elem-id') === "NA")	{
				alert("Already at the bottom!");
			}	else 	{
				var ret = {};
					ret[$(this).attr('elem-id')] = {index: $('#edit-btn').attr('elem-index')}
					ret[$('#edit-btn').attr('elem-id')] = {index: $(this).attr('elem-index')}
				update(ret);
			}
		});

		/*Start*/
		$('#refresh-btn').trigger('click');
	},
	error: function(err) {
		alert(JSON.stringify(arguments))

	}
});
