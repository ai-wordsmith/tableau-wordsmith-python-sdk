const Flask = {};

// send a request with data to the Flask back-end
const ping = (path, postData) => new Promise((resolve, reject) => {
  try {
    $.ajax({
      type: 'POST',
      url: path,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(postData),
      dataType: 'json',
      success: (response) => {
        resolve(response);
      },
      error: (response) => {
        reject(response);
      }
    });
  } catch (err) {
    reject(err);
  }
});

// flask call to process the underlying data from tableau
Flask.content = settings => ping('/content', settings);

module.exports = Flask;
