(function (window, document, $, undefined) {
    /**
     * Эпиграф
     * Я не могу сказать, чтомой код идиален,
     * это также говорить, как про то, что "я все знаю".
     * Постарался в коде отразить, возможные варианты работы jQuery на "боевом" сайте. 
     * "Человеку есть куда расти, если он осазнает свое несовершенство."
    */
    var methodTumb = {
        /**
         * @description - инициализация плагина
        */
        init: function(){
            var _this = $(this),
                _div = $('<div class="wrapper-slider-thumb" />'),
                width = 0,
                _items = _this.find('li');
           $.each(_this.find('li:lt(4)'), function(i){
                var _item = $(this);
                width += _item.outerWidth();
            });
            
            _div.append('<div class="slider-thumb" />');
            _div.append('<a href="#" class="nav-slider prev"><i class="fa fa-chevron-circle-left"></i></a><a href="#" class="nav-slider next"><i class="fa fa-chevron-circle-right"></i></a>');
            _div.css({
                width: width,
                'margin-left': -1 * width/2
            });
            
            _this.wrap(_div);
            /**
             * @description - перемотка слайдов
            */
            _this.closest('.wrapper-slider-thumb').find('.nav-slider').unbind().on('click', function(){
                var _a = $(this);
                    _this.tumbSlider('switching', _a.hasClass('next'));
                return false;
            });
            
            return this;
        },
        switching: function(status){
            var _this = $(this),
                _spliceIndex = !status ? -1 : 0,
                _spliceItem = _this.find('li:eq('+_spliceIndex+')'),
                left = (status ? -1 : 1) * _spliceItem.outerWidth();
                
            if(!status) {
                _this.css('left', -1 * left);
            }
            _this[!status ? 'prepend' : 'append'](_spliceItem.clone(true));
            
           _this.animate({
                'left': status ? left : 0
            },{
                'duration' : 350,
                'queue': true,
                'done': function(){
                    _spliceItem.remove();
                    _this.css({
                        'left' : 0
                    });
                }
            });
        }
        
    };
    
    /**
     * @description - Плагин для миниатюр (Этот вариант правильный, даже больше
     * считается "хорошим тоном", создания плагинов для jQuery).
    */
    $.fn.tumbSlider = function(method){
        if(this.length == 0) return this;
        if ( methodTumb[method] ) {
          return methodTumb[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
          return methodTumb.init.apply( this, arguments );
        } else {
          $.error( 'Метод с именем ' +  method + ' не существует для jQuery.tumbSlider' );
        }
        return this;
    };
 
    /**
     * @description - Плагин для основного слайдера, по сути это вариант неправильный, 
     * но и таким тоже можно пользоваться при написании.
    */
    $.fn.slider = function() {
        if(this.length == 0) return this;

		// support mutltiple elements
		if(this.length > 1){
			this.each(function(){$(this).slider()});
			return this;
		}
        var self = this;
        /**
         * @description - принудительная загрузка изображения
        */
        var loadImage = function(img, callback){
            var total = img.length;
            if (total == 0){
				callback();
				return;
			};
           
            var count = 0;
            img.one('load', function() {
                var _this = $(this);
                if(++count == total) callback();
            }).each(function() {
                if(this.complete) $(this).load();
            });
        }
        /**
         * @description - инициализация плагина
        */
        var init = function(){
            var _this = $(self),
                _items = _this.find('.slider__item'),
                _itemsLength = _items.length,
                _ulTumb, _firstItem, _liTumb;
            if(!_itemsLength) return;
            _ulTumb = $('<ul />').addClass('thumbnails');
            _firstItem = _items.eq(0).addClass('active');
            _items.hide();
            _items.each(function(index){
                var _item = $(this);
                    originalSrc = _item.find('img').prop('src');
                    _item.queue(function(){
                        var _li = $('<li />');
                        /**
                         * @description - создание миниатюр для навигации
                        */
                        var preview = getPreview(originalSrc, 50, 50, 'preview');
                        preview.get(function (err, img){
                            var url = img.toDataURL();
                           _li.append($('<img />').attr('src', url));
                        });
                        _ulTumb.append(_li.data('index', index));
                        _item.dequeue();
                    });
            });
            /**
             * @description - добавление кнопок Вперед/Назад
            */
            _this.append('<a href="#" class="nav-slider prev"><i class="fa fa-chevron-left"></i></a><a href="#" class="nav-slider next"><i class="fa fa-chevron-right"></i></a>');
            _ulTumb.find('li:eq(0)').addClass('active');
            _this.append(_ulTumb);
            
            _this.find('.thumbnails li').unbind().on('click', function(){
                var _li = $(this);
                _li.siblings().removeClass('active').end().addClass('active');
                switching(_items.eq(_li.data('index')), self);
                return false;
            });
            
            _this.find('.nav-slider').unbind().on('click', function(){
                var _a = $(this),
                    _liCurrent = $('li.slider__item.active', self),
                    _liIndex = _liCurrent.index(),
                    status = _a.hasClass('next'),
                    _liActiveTumb = $('.thumbnails li.active', self),
                    _tumbParent = _liActiveTumb.parent(),
                    offsetLiTumb = _liActiveTumb.offset().left + (status ? _liActiveTumb.outerWidth() : 0),
                    offsetTumb = _tumbParent.offset().left + (status ? _tumbParent.outerWidth() : 0),
                    index = status ? _liIndex + 1 : _liIndex - 1; 
                    index = index >= _itemsLength ? 0 : index;
                    
                    if(offsetTumb == offsetLiTumb) {
                        _tumbParent.tumbSlider('switching', status);
                    }
                var _selectItemTumb = _liActiveTumb.removeClass('active')[status ? 'next' : 'prev']();
                    _selectItemTumb = _selectItemTumb.length ? _selectItemTumb : _tumbParent.find('li:eq('+(status ? 0 : -1)+')');
                    _selectItemTumb.addClass('active');
                
                switching(_items.eq(index), self);
                return false;
            });
            _firstItem.parent().addClass('init-slider');
            if(_ulTumb.find('li').length > 4) {
            	loadImage(_ulTumb.find('img'), function(){
            		_ulTumb.tumbSlider();
            	});
            }
            $('.thumbnails li.active', _this).click();
        };
        /**
         * @description - переключить слайд
        */
        var switching = function(item, selector){
            var siblings = item.siblings();
            var itemCurrent = $(selector).find('.slider__item.active');
            itemCurrent.removeClass('active').fadeOut(200);
            item.addClass('active').fadeIn(400);
            resize();
        };
        /**
         * @description - пересчитать размеры
        */
        var resize = function(){
            var item = $(self).find('.slider__item.active'),
                _parent = item.parent(),
                img = item.find('img');
             _parent.stop().animate({
                height: img.height()
            }, 400);
        };
        $( window ).resize(resize);
        /**
         * @description - получить превью изображения через библиотеку FileAPI
         * @param string src - путь до картинки
         * @param int width - ширина новой картинки
         * @param int height - высота новой картинки
         * @return object canvas thumb - новая картинка 
        */
        var getPreview = function(src, width, height, type){
            var thumb = FileAPI.Image(src);
            thumb.resize(width, height, type || 'max');
            return thumb;
        };
        
        init();
        return this;
    };
    
}(window, document, jQuery));
