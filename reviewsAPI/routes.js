const express = require('express');
const controllers = require('./controllers/index.js');
const router = express.Router();

router.get('/loaderio-d24661adb6c698a92c6accc4aa81af60', controllers.loader.get);
router.get('/reviews', controllers.reviews.getReviews);
router.get('/reviews/meta', controllers.reviewsMeta.getMetaReviews);
router.post('/reviews', controllers.reviews.postReview);
router.put('/reviews/:review_id/helpful', controllers.helpful.updateHelpfulness);
router.put('/reviews/:review_id/report', controllers.report.reportReview);

module.exports = router;
