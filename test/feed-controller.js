const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');
const io = require('../socket');
const FeedController = require('../controllers/feed');

describe('Feed controller', function () {
    // "before" runs before all test once and not repeated
    before(function (done) {
        mongoose
            .connect(
                'mongodb+srv://blckvia:blckviaRock@cluster0.dhwfct2.mongodb.net/test-messages'
            )
            .then((result) => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'tester',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a',
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });

    it('should add a created post to the posts of the creator', function (done) {
        const req = {
            body: {
                title: 'Test post',
                content: 'Test post',
            },
            file: {
                path: 'abc',
            },
            userId: '5c0f66b979af55031b34728a',
        };
        const res = {
            status: function () {
                return this;
            },
            json: function () {},
        };
        sinon.stub(io, 'getIO');
        io.getIO.returns({ emit: () => {} });

        FeedController.createPost(req, res, () => {})
            .then((savedUser) => {
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1);
                io.getIO.restore();
                done();
            })
            .catch((err) => {
                // Added for cathing error
                done(err);
            });
    });

    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});
