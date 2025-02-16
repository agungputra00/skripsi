const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/index.html');
});

app.get('/loker', (req, res) => {
  res.sendFile(__dirname + '/pages/loker.html');
});

app.get('/tentang-kami', (req, res) => {
  res.sendFile(__dirname + '/pages/tentang-kami.html');
});

app.get('/data-pelamar', (req, res) => {
  res.sendFile(__dirname + '/pages/data-pelamar.html');
});

app.get('/info', (req, res) => {
  res.sendFile(__dirname + '/pages/info.html');
});

app.get('/diorama-login', (req, res) => {
  res.sendFile(__dirname + '/pages/login.html');
});

app.get('/registrasi', (req, res) => {
  res.sendFile(__dirname + '/pages/registrasi.html');
});

const handleSubmission = (req, res, type) => {
  const data = {
    id: Date.now(), // Menambahkan ID yang di-generate berdasarkan timestamp
    nama: req.body[`nama_${type}`],
    telephone: req.body[`telephone_${type}`],
    email: req.body[`email_${type}`],
    ttl: req.body[`ttl_${type}`],
    tanggal_lahir: req.body[`tanggal_lahir_${type}`],
    pendidikan: req.body[`pendidikan_${type}`],
    jk: req.body[`jk_${type}`],
    gear: req.body[`gear_${type}`],
    photo_ktp: req.body[`photo_ktp_${type}`],
    cv: req.body[`cv_${type}`],
    type: type,
    status: 'menunggu',
  };

  if (data.photo_ktp) {
    data.photo_ktp = data.photo_ktp.slice(7, data.photo_ktp.length);
  }

  if (data.cv) {
    data.cv = data.cv.slice(7, data.cv.length);
  }

  const fullData = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
  const jsonData = JSON.stringify([...fullData, data]);

  fs.writeFile('data/data.json', jsonData, (err) => {
    if (err) {
      console.error('Terjadi kesalahan saat menulis file:', err);
      res.redirect('/loker?pesan=Terjadi kesalahan saat menyimpan data.');
      return;
    }
    res.redirect('/loker?pesan=Berhasil Mengirim');
  });
};

app.post('/submit-photographer', (req, res) => handleSubmission(req, res, 'photographer'));
app.post('/submit-videographer', (req, res) => handleSubmission(req, res, 'videographer'));
app.post('/submit-editor', (req, res) => handleSubmission(req, res, 'editor'));

app.get('/data-json', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(500).send(`Token tidak tersedia.`)
    return;
  }

  try {
    jwt.verify(token, 'rahasia');
  } catch (err) {
    res.status(500).send(`Token tidak valid.`);
    return;
  }

  fs.readFile('data/data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Terjadi kesalahan saat membaca file:', err);
      res.status(500).send('Tidak dapat membaca data.');
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.get('/approve/:id', (req, res) => {
  const { id } = req.params

  fs.readFile('data/data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Terjadi kesalahan saat membaca file:', err);
      res.status(500).send('Tidak dapat membaca data.');
      return;
    }
    let parseData = JSON.parse(data);

    let isData = parseData.find(val => val.id == id);
    let isIndex = parseData.findIndex(val => val.id == id);
    isData.status = 'approved';

    parseData[isIndex] = isData;

    fs.writeFile('data/data.json', JSON.stringify(parseData), (err) => {
      if (err) {
        console.error('Terjadi kesalahan saat menulis file:', err);
        res.redirect('/data-pelamar?pesan=Terjadi kesalahan saat menyetujui data.');
        return;
      }
      res.redirect('/data-pelamar?pesan=Berhasil Menyetujui');
    });
  });
});

app.get('/reject/:id', (req, res) => {
  const { id } = req.params

  fs.readFile('data/data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Terjadi kesalahan saat membaca file:', err);
      res.status(500).send('Tidak dapat membaca data.');
      return;
    }
    let parseData = JSON.parse(data);

    let isData = parseData.find(val => val.id == id);
    let isIndex = parseData.findIndex(val => val.id == id);
    isData.status = 'rejected';

    parseData[isIndex] = isData;

    fs.writeFile('data/data.json', JSON.stringify(parseData), (err) => {
      if (err) {
        console.error('Terjadi kesalahan saat menulis file:', err);
        res.redirect('/data-pelamar?pesan=Terjadi kesalahan saat reject data.');
        return;
      }
      res.redirect('/data-pelamar?pesan=Berhasil Reject');
    });
  });
});

app.get('/hapus/:id', (req, res) => {
  const { id } = req.params

  fs.readFile('data/data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Terjadi kesalahan saat membaca file:', err);
      res.status(500).send('Tidak dapat membaca data.');
      return;
    }
    let parseData = JSON.parse(data)

    parseData.splice(parseData.findIndex(val => val.id == id), 1)

    fs.writeFile('data/data.json', JSON.stringify(parseData), (err) => {
      if (err) {
        console.error('Terjadi kesalahan saat menulis file:', err);
        res.redirect('/data-pelamar?pesan=Terjadi kesalahan saat menghapus data.');
        return;
      }
      res.redirect('/data-pelamar?pesan=Berhasil Menghapus');
    });
  });
});

app.get('/login', (req, res) => {
  const { email, password, direct } = req.query;
  fs.readFile('data/users.json', (err, data) => {
    if (err) {
      console.error('Terjadi kesalahan saat membaca file:', err);
      res.status(500).send('Tidak dapat membaca data.');
      return;
    }
    let users = JSON.parse(data)
    let user = users.find(val => val.username == email)

    if (user && user.password == password) {
      const token = jwt.sign({ email }, 'rahasia', { expiresIn: '1h' });
      res.json({ token, isAdmin: user.isAdmin, direct: `${direct}?pesan=${email} Berhasil Login` });
    } else {
      res.status(401).send('Email atau password tidak valid');
    }
  })
});

app.post('/register', (req, res) => {
  const { username, password, direct} = req.body;
  let users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));

  if (users.find(val => val.username == username)) {
    res.redirect('/registrasi?pesan=username sudah terdaftar')
  } else {
    users = [...users, { username, password, isAdmin: false }]
    fs.writeFile('data/users.json', JSON.stringify(users), (err) => {
      if (err) {
        console.error('Terjadi kesalahan saat menulis file:', err);
        return res.redirect('/registrasi?pesan=username tidak valid');
      }

      return res.redirect('/?pesan=Berhasil membuat account')
    });
  }
})

app.post('/upload-files', async (req, res) => {
  let date = Date.now()
  const storage = await multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === "photo_ktp") {
        cb(null, 'public/images/ktp');
      } else if (file.fieldname === "cv") {
        cb(null, 'public/images/cv');
      }
    },
    filename: function (req, file, cb) {
      cb(null, date + '-' + file.originalname);
    }
  });

  const upload = await multer({ storage: storage }).fields([
    { name: 'photo_ktp', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
  ]);

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ message: 'Gagal mengunggah file.' });
    } else if (err) {
      res.status(500).json({ message: 'Kesalahan server saat mengunggah.' });
    } else {
      res.status(200).json({ message: 'File berhasil diunggah.', files: req.files });
    }
  });
});

app.get('/update-informasi', (req, res) => {
  const fullData = JSON.parse(fs.readFileSync('data/informasi-penting.json', 'utf8'));
  const jsonData = JSON.stringify(Object.assign(fullData, req.query));

  fs.writeFile('data/informasi-penting.json', jsonData, (err) => {
    if (err) {
      console.error('Terjadi kesalahan saat menulis file:', err);
      res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data.' });
      return;
    }
    res.status(200).json(JSON.parse(jsonData));
  });
});


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
