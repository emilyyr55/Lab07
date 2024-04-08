var app = angular.module('bloggerApp', [ 'ui.router']);


//*** Router Provider ***
app.config( function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("blog-list");
  
  $stateProvider
      .state("home", {
        url: "",
          templateUrl: 'pages/home.html',
          controller: 'HomeController',
          controllerAs: 'vm'
          })

      .state('blog-list', {
        url: "/blog-list",
          templateUrl: 'pages/blog-list.html',
          controller : 'ListController',
          controllerAs: 'vm'
          })
      .state('blog-add', {
        url: "/blog-add",
	      templateUrl: 'pages/blog-add.html',
		  controller: 'AddController',
		  controllerAs: 'vm'
		  })
      .state('blog-edit', {
        url: "/blog-edit/:id",
            templateUrl: 'pages/blog-edit.html',
            controller: 'EditController',
            controllerAs: 'vm'
            })  
      .state('blog-delete', {
        url: "/blog-delete/:id",
            templateUrl: 'pages/blog-delete.html',
            controller: 'DeleteController',
            controllerAs: 'vm'
            })
      .state('login', {
        url: "/login",
            templateUrl: 'common/auth/login.html',
            controller: 'LoginController',
            controllerAs: 'vm'
            })
       .state('register', {
        url: "/register",
            templateUrl: 'common/auth/register.html',
            controller: 'RegisterController',
            controllerAs: 'vm'
            });
      

    });


//*** Controllers ***
app.controller('HomeController', function HomeController() {
    var vm = this;
    vm.pageHeader = {
        title: "My Blog"
    };
    vm.message = "Welcome to my blog site!";
});

//*** REST Web API functions ***
function getAllBlogs($http) {
    return $http.get('/api/blogs');
}

function getBlogById($http, id) {
    return $http.get('/api/blogs/' + id);
}

function updateBlogById($http,authentication, id, data) {
    return $http.put('/api/blogs/' + id, data, { headers: { Authorization: 'Bearer '+ authentication.getToken() }} );
}

function createBlog($http, authentication, data) {
    return $http.post('/api/blogs', data, { headers: { Authorization: 'Bearer '+ authentication.getToken() }} );
}

function deleteBlog($http, authentication, id) {
    return $http.delete('/api/blogs/' + id, { headers: { Authorization: 'Bearer '+ authentication.getToken() }} );
}

//*** Controllers ***
app.controller('ListController', function ListController($http, authentication) {
    var vm = this;
    vm.pageHeader = {
        title: 'Blog List'
    };
    
    

    vm.isLoggedIn = function() {
        return authentication.isLoggedIn();
    }

    getAllBlogs($http)
    .then(function (response){
        vm.blogs = response.data;
        console.log(response);
        vm.message = "Blog data found!";
    },function (error){
        vm.message = "Could not get list of blogs";
    });
});



app.controller('EditController', [ '$http',  '$state','authentication', function EditController($http, $state, authentication) {
    var vm = this;
    vm.blog = {};       // Start with a blank blog
    console.log($state.getCurrentPath());
    vm.id = $state.getCurrentPath()[1].paramValues.id;    // Get id from $routParams which must be injected and passed into controller
    vm.pageHeader = {
        title: 'Blog Edit'
    };
    
    // Get blog data so it may be displayed on edit page
    getBlogById($http, vm.id)
        .then(function (response){
            console.log(response.data);
            vm.blog = response.data;
        vm.message = "Blog data found!";
        },function (error){
            vm.message = "Could not get blog given id of " + vm.id;
        });
    
    // Submit function attached to ViewModel for use in form
    vm.submit = function() {
        var data = vm.blog;
        data.blogTitle = userForm.blogTitle.value;
        data.blogText = userForm.blogText.value;
               
        updateBlogById($http, authentication,vm.id, data)
          .then(function(response) {
            vm.message = "Blog data updated!";
            
            $state.go('blog-list');   // Refer to blog for info on StateProvder
            
          },function (error) {
            vm.message = "Could not update blog given id of " + vm.id + userForm.blogTitle.text + " " + userForm.blogText.text;
          });
    }
}]);

app.controller('AddController', [ '$http', '$state','authentication', function EditController($http, $state, authentication) {
    var vm = this;
    vm.blog = {};       // Start with a blank blog
    vm.pageHeader = {
        title: 'Blog Add'
    };
    
    // Submit function attached to ViewModel for use in form
    vm.submit = function() {
        var data = vm.blog;
        data.blogTitle = userForm.blogTitle.value;
        data.blogText = userForm.blogText.value;
               
        createBlog($http, authentication, data)
          .then(function(response) {
            vm.message = "Blog data posted!";
            $state.go('blog-list', {}, {reload: true});   // Refer to blog for info on StateProvder
          },function (error) {
            vm.message = "Could not post blog" ;
          });
    }
}]);

app.controller('DeleteController', [ '$http', '$state','authentication', function DeleteController($http, $state, authentication) {
    var vm = this;   
    
    vm.id = $state.getCurrentPath()[1].paramValues.id;     // Get id from $routParams which must be injected and passed into controller
    vm.pageHeader = {
        title: 'Delete Blog'
    };

    getBlogById($http, vm.id)
        .then(function (response){
            console.log(response.data);
            vm.blog = response.data;
        vm.message = "Blog data found!";
        },function (error){
            vm.message = "Could not get blog given id of " + vm.id;
        });
    
    // Submit function attached to ViewModel for use in form
    vm.submit = function() {
               
        deleteBlog($http,authentication, vm.id)
          .then(function(response) {
            vm.message = "Blog data deleted!";
            $state.go('blog-list', {}, {reload: true});   // Refer to blog for info on StateProvder
          },function (error) {
            vm.message = "Blog was unable to be deleted";
          });
    }
}]);



