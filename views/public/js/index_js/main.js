jQuery(document).ready(function($){
    
    // jQuery sticky Menu
    
	$(".mainmenu-area").sticky({topSpacing:0});
    
    
    $('.product-carousel').owlCarousel({
        loop:true,
        nav:true,
        margin:20,
        responsiveClass:true,
        responsive:{
            0:{
                items:1,
            },
            600:{
                items:3,
            },
            1000:{
                items:5,
            }
        }
    });  
    
    $('.related-products-carousel').owlCarousel({
        loop:true,
        nav:true,
        margin:20,
        responsiveClass:true,
        responsive:{
            0:{
                items:1,
            },
            600:{
                items:2,
            },
            1000:{
                items:2,
            },
            1200:{
                items:3,
            }
        }
    });  
    
    $('.brand-list').owlCarousel({
        loop:true,
        nav:true,
        margin:20,
        responsiveClass:true,
        responsive:{
            0:{
                items:1,
            },
            600:{
                items:3,
            },
            1000:{
                items:4,
            }
        }
    });    
    
    
    // Bootstrap Mobile Menu fix
    $(".navbar-nav li a").click(function(){
        $(".navbar-collapse").removeClass('in');
    });    
    
    // jQuery Scroll effect
    $('.navbar-nav li a, .scroll-to-up').bind('click', function(event) {
        var $anchor = $(this);
        var headerH = $('.header-area').outerHeight();
        $('html, body').stop().animate({
            scrollTop : $($anchor.attr('href')).offset().top - headerH + "px"
        }, 1200, 'easeInOutExpo');

        event.preventDefault();
    });    
    
    // Bootstrap ScrollPSY
    $('body').scrollspy({ 
        target: '.navbar-collapse',
        offset: 95
    })      
});

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-10146041-21', 'auto');
  ga('send', 'pageview');

// Obtener los botones de vista de cuadrícula y vista de lista
const gridViewButton = document.getElementById('grid-view-button');
const listViewButton = document.getElementById('list-view-button');

// Obtener el contenedor de productos
const productsContainer = document.getElementById('products-container');

const productsList = document.getElementById('product-table');

// Agregar un controlador de eventos para el botón de vista de cuadrícula
gridViewButton.addEventListener('click', () => {
  // Cambiar la clase CSS del contenedor de productos
  productsContainer.classList.remove('list-view');
  productsContainer.classList.add('grid-view');
  productsList.classList.remove('table-style-on')
  productsList.classList.add('table-style-off')
});

// Agregar un controlador de eventos para el botón de vista de lista
listViewButton.addEventListener('click', () => {
  // Cambiar la clase CSS del contenedor de productos
    productsContainer.classList.remove('grid-view')
  productsContainer.classList.add('list-view');
  productsList.classList.remove('table-style-off')
  productsList.classList.add('table-style-on')
});

// $(document).ready(function(){
//     $(".owl-carousel").owlCarousel({
//       items: 1,
//       nav: true
//     });
//   });

