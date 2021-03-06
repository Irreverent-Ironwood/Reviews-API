const models = require('../models');

const getReviews = (req, res, next) => {
  const product_id = req.query.product_id || 1;
  models.reviews.getReviews(product_id, (err, data) => {
    if (err) {
      res.status(400);
    } else {
      const reviews = {};
      const results = [];
      const curr_product_id = product_id
      reviews['product'] = product_id
      reviews['page'] = 0;
      reviews['count'] = data.length;
      reviews['results'] = results;
      for (var review of data) {

        const eachReview = {};
        const photos = [];
        eachReview['review_id'] = review.id;
        eachReview['rating'] = review.rating;
        eachReview['summary'] = review.summary;
        eachReview['recommend'] = Boolean(review.recommend);
        eachReview['response'] = review.response === 'null' ? null : review.response;
        eachReview['body'] = review.body;
        eachReview['date'] = review.review_date;
        eachReview['reviewer_name'] = review.reviewer_name;
        eachReview['helpfulness'] = review.helpfulness;
        photos.push(review.photo_url);
        eachReview['photos'] = photos;
        results.push(eachReview);
      }
      res.send(reviews);
      next()
    }
  })
}

/* post request to add a new review */

const postReview = (req, res, next) => {
  const review = {};
  const photos = [];
  review['product_id'] = req.body.product_id;
  review['rating'] = req.body.rating;
  review['review_date'] = req.body.date;
  review['summary'] = req.body.summary;
  review['body'] = req.body.body;
  review['recommend'] = (req.body.recommend === 'true') || 0;
  review['reported'] = (req.body.reported === 'true') || 0;
  review['reviewer_name'] = req.body.name;
  review['reviewer_email'] = req.body.email;
  review['response'] = req.body.response || null;
  review['helpfulness'] = req.body.helpfulness || 0;

  models.reviews.postReview(review, (err, data) => {
    if (err) {
      res.status(404);
    } else {
      const review_id = data.insertId;

      var itemsProcessed = 0;
      for (var photo of req.body.photos) {

        if (isValidURL(photo)) {
          models.reviews.postPhotos(review_id, photo, (err, data) => {
            if (err) {
              res.status(404);
            }
            itemsProcessed++;
              if(itemsProcessed === req.body.photos.length-1) {
                for (char in req.body.characteristics) {
                  models.reviews.postCharacteristics(char, (err, data) => {
                    if (err) {
                      res.status(404);
                    } else {
                      const char_id = data.insertId;
                      models.reviews.postCharProduct(char_id, req.body.product_id, (err, data) => {
                        if (err) {
                          res.status(404);
                        } else {
                          models.reviews.postCharReviews(char_id, review_id, req.body.characteristics[char], (err, data) => {
                            if(err) {
                              res.status(404);
                            } else {
                              res.status(201);
                              next()
                            }
                          })
                        }
                      })
                    }
                  })
                }
              }
          })
        }
      }
    }
  })
};


/* helper function to validate url */
const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

const isValidURL = (url) => {
  let str = url;
  // remove surrounding double quotes
  if (url[0] === '"' && url[0] === url[url.length - 1]) {
    str = url.substring(1, url.length - 1);
  }
  return !!urlPattern.test(str);
}

module.exports = { getReviews, postReview };