const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  llenarSelectRegiones();
});

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

function llenarSelectRegiones() {
  console.log("hola");
  db.ref('regiones').once('value', regiones => {
    let zonas = regiones.val();

    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (let zona in zonas) {
      options += `<option value="${zona}">${zona}</option>`;
    }

    $('#region').html(options);
  });
}

//Vue.use(VueFire)

new Vue({
  el: '#newShop',
  data: {
    region: 'Seleccionar',
    clave: null,
    nombre: null,
    consorcio: 'Seleccionar',
    ciudad: null
  },
  firebase: {
    regiones: db.ref('regiones')
  },
  computed: {
    
  },
  methods: {
  }
})