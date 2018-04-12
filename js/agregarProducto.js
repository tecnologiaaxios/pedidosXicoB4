const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged((user) => {
    //si hay un usuario
    if (user) {
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}



//Vue.use(VueFire)

new Vue({
  el: '#newProduct',
  data: {
    clave: null,
    nombre: null,
    empaque: null
  },
   /* firebase: {
    vueProductos: db.ref('estadisticasProductos')  
  }, */
  computed: {
    
  },
  methods: {
    guardarProducto() {
        db.ref('listadoProductos').push({
            clave: this.clave,
            nombre: this.nombre,
            empaque: this.empaque
        });

        this.clave = null;
        this.nombre = null;
        this.empaque = null;
    }
  }
})