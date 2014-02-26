/// <reference path="jquery.js"/>
/*
* dragndrop
* version: 1.0.0 (05/13/2009)
* @ jQuery v1.2.*
*
* Licensed under the GPL:
*   http://gplv3.fsf.org
*
* Copyright 2008, 2009 Jericho [ thisnamemeansnothing[at]gmail.com ] 
*  usage:
*  
*/
(function($) {
    $.extend($.fn, {
        getCss: function(key) {
            var v = parseInt(this.css(key));
            if (isNaN(v))
                return false;
            return v;
        }
    });
	var dropables = [];
	var hitSource = -1;

	$.fn.Drops = function(opts)
	{
        var ps = $.extend({
            onDrop: function() { },
            onOver: function() { },
			overClass: 'over',
			enabled:true
        }, opts);	

		return this.each(function(i) {
			var dropable = {
				overClass: opts.overClass,
				enabled: opts.enabled,
				onDrop: opts.onDrop,
				onOver: opts.onOver,
				over: false,
				element:$(this),
				x1:$(this).offset().left,
				x2:$(this).offset().left + $(this).width(),
				y1:$(this).offset().top,
				y2:$(this).offset().top + $(this).height()
			};
			
			dropables.push(dropable);
		});
	};

	// 
	$.fn.Drops.drop = function()
	{
		// console.log('dropped !' + dropables[hitSource]);
	};

	$.fn.Drops.intersect = function(event)
	{
        var dragData = event.data.dragData;
		var x1 = dragData.target.offset().left;
		var x2 = dragData.target.offset().left + dragData.target.width();
		var y1 = dragData.target.offset().top;
		var y2 = dragData.target.offset().top + dragData.target.height();

		for (var i = 0; i < dropables.length; i++)
		{
			if ((dropables[i].element[0] !== event.data.dragData.target[0]) && dropables[i].enabled === true)
			{
				var dropable = dropables[i];
				if ((x2 > dropable.x1) && (x1 < dropable.x2) && (y2 > dropable.y1) && (y1 < dropable.y2))
				{
					dropable.over = true;
					dropable.element.addClass(dropable.overClass);
					dropable.onOver(event);
					return i;
				}
				else
				{
					dropable.element.removeClass(dropable.overClass);
					dropable.over = false;
					return -1;
				}
			}
			else
			{
				//console.log('skipping self comparison or disabled dropable ' + i);
				return -1;
			}
		}
		return -1;
	}

    $.fn.Drags = function(opts)
	{

		// build options object
        var ps = $.extend({
            zIndex: 20,
            opacity: .7,
            handler: null,
            onMove: function() { }
        }, opts);

		var dragndrop =
		{
			// called on mousemove
            drag: function(e)
			{
                var dragData = e.data.dragData;

				// follows mouse cursor
                dragData.target.css({
                    left: dragData.left + e.pageX - dragData.offLeft,
                    top: dragData.top + e.pageY - dragData.offTop
                });
				
				// be sure to use the mouse cursor (should we do that here ?)
                dragData.handler.css({ cursor: 'move' });
				
				hitSource = $.fn.Drops.intersect(e);
				
				// call onMove() callback
                dragData.onMove(e);
            },
			// called on mousedrop
            drop: function(e)
			{
                var dragData = e.data.dragData;
                // restores opacity and cursors (problem: we have some unsupported properties in this object, FIX ME)
				e.data.dragData.target.css(dragData.oldCss); //.css({ 'opacity': '' });
                dragData.handler.css('cursor', dragData.oldCss.cursor);

				// don't listen to these events anymore: be sure to remove listeners before going back to previous position,
				// otherwise intersect will be called while the animation
                $(document).unbind('mousemove', dragndrop.drag);
				$(document).unbind('mouseup', dragndrop.drop);

				// element has been dropped over an actived element
				if (hitSource != -1)
					$.fn.Drops.drop();
				else // get back to its position
					// if not dropped on a droppable, gets back to its position
					dragData.target.animate({
						left: dragData.oldOffsets.left + 'px',
						top: dragData.oldOffsets.top + 'px'
					}, 200);
            }
        };

        return this.each(function()
		{
            var me = this;
            var handler = null;
            
			// if no handler is specified we assume the whole object can handle the drag event
			if (typeof ps.handler == 'undefined' || ps.handler == null)
                handler = $(me);
            else
                handler = (typeof ps.handler == 'string' ? $(ps.handler, this) : ps.handler);
				
			handler.bind('mousedown', { e: me }, function(event) 
			{
                var target = $(event.data.e);
                var oldCss = {};
                if (target.css('position') != 'absolute')
				{
                    try 
					{
                        target.position(oldCss);
                    }
					catch (ex) { }

                    target.css('position', 'absolute');
                }
                
				// save css properties we're about to change
				oldCss.cursor = target.css('cursor') || 'default';
                oldCss.opacity = target.getCss('opacity') || 1;

                // Let's keep some information
				var dragData =
				{
                    left: oldCss.left || target.getCss('left') || 0,
                    top: oldCss.top || target.getCss('top') || 0,
                    width: target.width() || target.getCss('width'),
                    height: target.height() || target.getCss('height'),
                    offLeft: event.pageX,
                    offTop: event.pageY,
					oldOffsets: target.offset(), // let's keep track of old position as well
                    oldCss: oldCss,
                    onMove: ps.onMove,
                    handler: handler,
                    target: target
                }
                
				target.css('opacity', ps.opacity);

				// now we need to keep track of mousemove & mouseup events
                $(document).bind('mousemove', { dragData: dragData }, dragndrop.drag);
				$(document).bind('mouseup', { dragData: dragData }, dragndrop.drop);
            }); // mousedown
        });
    }
})(jQuery); 