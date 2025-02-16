const token = localStorage.getItem('authToken');
let fullData = [];

fetch('/data-json', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => {
    const isAdmin = localStorage.getItem('isAdmin');
    const email = localStorage.getItem('emailLogin');

    if (isAdmin == 'false') {
      data = data.filter(val => val.email == email)
    }

    fullData = data;
    if (data.length === 0) {
      document.getElementById('data-pelamar').innerHTML = '<p>Tidak ada data</p>';
      return;
    }

    const html = data.map(item => `
        <div class="col-md-3">
            <div class="product-card">
                <div class="product-card-img">
                    <img style="width: 100%;" src="${item.photo_ktp}" alt="Profile">
                </div>
                <div class="product-card-body">
                    <p class="product-brand">${item.type}</p>
                    <h5 class="product-name">
                        <a href="#" onclick="showDetails('${item.id}')">${item.nama}</a>
                    </h5>
                    <div class="mt-2">
                        <button class="btn btn1" style="width: 100%;" onclick="showDetails('${item.id}')">Lihat</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('data-pelamar').innerHTML = html;
  })
  .catch(error => {
    console.error('Terjadi kesalahan dalam mengambil data:', error);
    document.getElementById('data-pelamar').innerHTML = '<p>Gagal memuat data. Silakan coba lagi.</p>';
    alert(error.message);
    window.location.href = `/`;
    localStorage.removeItem('emailLogin')
    localStorage.removeItem('authToken')
  });

// Get Current Year
function getCurrentYear() {
  var d = new Date();
  var year = d.getFullYear();
  document.querySelector("#displayDateYear").innerText = year;
}
getCurrentYear()

//client section owl carousel
$(".owl-carousel").owlCarousel({
  loop: true,
  margin: 10,
  nav: true,
  dots: false,
  navText: [
    '<i class="fa fa-long-arrow-left" aria-hidden="true"></i>',
    '<i class="fa fa-long-arrow-right" aria-hidden="true"></i>'
  ],
  autoplay: true,
  autoplayHoverPause: true,
  responsive: {
    0: {
      items: 1
    },
    768: {
      items: 2
    },
    1000: {
      items: 2
    }
  }
});

/** google_map js **/

function myMap() {
  var mapProp = {
    center: new google.maps.LatLng(40.712775, -74.005973),
    zoom: 18,
  };
  var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

function showDetails(id) {
  const data = fullData.find(item => item.id == id);
  const modal = document.getElementById('data-modal');
  const container = document.getElementById('data-container');
  const isAdmin = localStorage.getItem('isAdmin');
  if (!data) {
    container.innerHTML = '<p>Data tidak tersedia.</p>';
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';

    if (isAdmin == 'false') {
      container.innerHTML = `
        <div>
        <div style="display: flex;">
          <h3 style="flex: 15">Detail Pelamar</h3>
          <a href="/hapus/${data.id}">
            <button style="flex: 1; background-color:rgb(0, 0, 0); margin: 10px; border-radius: 5px; color: white; border-color:rgb(134, 133, 133)">Hapus</button>
          </a>
        </div>
        <div style="display: flex; background-color:${data.status == 'menunggu' ? '#fcba03': data.status == 'approved' ? '#14cc03' : '#cc0303'}; justify-content: center; align-item: center; padding: 20px; margin-bottom: 20px; font-size: 20px; color: white">${data.status.toUpperCase()}</div>
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px; font-size: 15px">${data.status == 'menunggu' ? 'Menunggu konfirmasi dari admin' : data.status == 'approved' ? 'Selamat anda berhasil memenuhi syarat untuk bergabung bersama tim kami, mohon tunggu untuk informasi selanjutnya, tim kami akan menghubungi melalui email atau whatsapp yang terdaftar. <br/><br/> Terima kasih, Admin Diorama' : 'Maaf pengajuan anda di tolak karena belum memenuhi kriteria yang di butuhkan'}</div>
        <p><strong>ID:</strong> ${data.id}</p>
        <p><strong>Pekerjaan yang di lamar:</strong> ${data.type}</p>
        <p><strong>Nama:</strong> ${data.nama}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Jenis Kelamin:</strong> ${data.jk}</p>
        <p><strong>Tempat Tanggal Lahir:</strong> ${data.ttl}, ${data.tanggal_lahir}</p>
        <p><strong>Nomor Telepon:</strong> ${data.telephone}</p>
        <p><strong>Pendidikan:</strong> ${data.pendidikan}</p>
        <p><strong>Gear:</strong> ${data.gear}</p>
        <p><strong>CV: </strong>
          <a href="${data.cv}">
            <button class="btn btn1" style="width: 100px; background-color: #0355cc; color: white;">Lihat</button>
          </a>
        </p>
        <p><strong>Photo KTP:</strong> <img style="width: 100%;" src="${data.photo_ktp}" alt="Photo KTP"></p>
        </div>
    `;
    } else {
      container.innerHTML = `
            <div>
            <div style="display: flex;">
              <h3 style="flex: 15">Detail Pelamar</h3>
              <a href="/approve/${data.id}">
                <button style="flex: 1; background-color:#14cc03; margin: 10px; border-radius: 5px; color: white; border-color:rgb(46, 204, 41)">Approve</button>
              </a>
              <a href="/reject/${data.id}">
                <button style="flex: 1; background-color: #cc0303; margin: 10px; border-radius: 5px; color: white; border-color: #cc2929">Reject</button>
              </a>
              <a href="/hapus/${data.id}">
                <button style="flex: 1; background-color:#000000; margin: 10px; border-radius: 5px; color: white; border-color:rgb(134, 133, 133)">Hapus</button>
              </a>
            </div>
            <div style="display: flex; background-color:${data.status == 'menunggu' ? '#fcba03': data.status == 'approved' ? '#14cc03' : '#cc0303'}; justify-content: center; align-item: center; padding: 20px; margin-bottom: 20px; font-size: 20px; color: white">${data.status.toUpperCase()}</div>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Pekerjaan yang di lamar:</strong> ${data.type}</p>
            <p><strong>Nama:</strong> ${data.nama}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Jenis Kelamin:</strong> ${data.jk}</p>
            <p><strong>Tempat Tanggal Lahir:</strong> ${data.ttl}, ${data.tanggal_lahir}</p>
            <p><strong>Nomor Telepon:</strong> ${data.telephone}</p>
            <p><strong>Pendidikan:</strong> ${data.pendidikan}</p>
            <p><strong>Gear:</strong> ${data.gear}</p>
            <p><strong>CV: </strong>
              <a href="${data.cv}">
                <button class="btn btn1" style="width: 100px; background-color: #0355cc; color: white;">Lihat</button>
              </a>
            </p>
            <p><strong>Photo KTP:</strong> <img style="width: 100%;" src="${data.photo_ktp}" alt="Photo KTP"></p>
            </div>
        `;
    }
  }
}

function closeModal() {
  document.getElementById('data-modal').style.display = 'none';
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const direct = document.getElementById('direct').value;

  fetch(`/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&direct=${encodeURIComponent(direct)}`)
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('emailLogin', email)
        localStorage.setItem('isAdmin', data.isAdmin)
        window.location.href = data.direct;
      } else {
        alert('Login gagal');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error saat login');
    });
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('emailLogin');
  alert('Berhasil Keluar')
}

function uploadFileKtp(input) {
  var file = input.files[0];
  if (file) {
    var formData = new FormData();
    formData.append('photo_ktp', file);
    uploadFile(formData, input.name)
  }
}

function uploadFileCV(input) {
  var file = input.files[0];
  if (file) {
    var formData = new FormData();
    formData.append('cv', file);
    uploadFile(formData, input.name)
  }
}

function uploadFile(formData, id) {
  console.log('masuk id: ', id.replace('path_'))
  fetch('/upload-files', {
    method: 'POST',
    body: formData
  })
    .then(data => data.json())
    .then(response => {
      if (id.includes('ktp')) {
        console.log('masuk response ktp: ', response.files.photo_ktp[0].path)
        document.getElementById(id.replace('path_', '')).value = response.files.photo_ktp[0].path;
      } else if (id.includes('cv')) {
        console.log('masuk response cv: ', response.files.cv[0].path)
        document.getElementById(id.replace('path_', '')).value = response.files.cv[0].path;
      }
      return response
    })
    .then(data => alert(data.message))
    .catch(error => alert('Gagal mengunggah file: ' + error));
}

function updateInformasi(event) {
  event.preventDefault();
  const judul = document.getElementById('judul').value;
  const deskripsi = document.getElementById('deskripsi').value;

  console.log('masuk deskripsi: ', deskripsi)

  fetch(`/update-informasi?judul=${encodeURIComponent(judul)}&deskripsi=${encodeURIComponent(deskripsi)}`)
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('judul', data.judul);
      localStorage.setItem('deskripsi', data.deskripsi)
      alert('Berhasil update.')
      window.location.href = '/info';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error saat update deskripsi');
    });
}