/**
 * auth.test.js
 * @description :: contains test cases of APIs for authentication module.
 */

const dotenv = require('dotenv');
dotenv.config();
process.env.NODE_ENV = 'test';
const db = require('mongoose');
const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../../app');
const authConstant = require('../../constants/authConstant');
const uri = 'mongodb://127.0.0.1:27017';

const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

let insertedUser = {};

beforeAll(async function (){
  try {
    await client.connect();
    const dbInstance = client.db('EcomDb_test');
    const user = dbInstance.collection('users');
    insertedUser = await user.insertOne({
      username: 'Maria.Padberg7',
      password: 'h3HfaXlM4IZvvts',
      email: 'Katlynn.Streich@yahoo.com',
      name: 'Miss Melody Ziemann',
      shippingAddress: [
        {
          _id: false,
          pincode: 'improvement',
          address1: 'Lead',
          address2: 'Rapid',
          landmark: 'Zloty',
          city: 'Soft',
          isDefault: false,
          state: 'Principal',
          addressType: 'users',
          fullName: 'Dollar',
          mobile: 584,
          addressNo: 588
        }
      ],
      wishlist: [ {
        _id: false,
        productId: 'Account' 
      } ],
      userType: 511,
      mobileNo: '(132) 779-1678',
      resetPasswordLink: {},
      loginRetryLimit: 983,
      loginReactiveTime: '2022-08-17T08:55:09.447Z',
      id: '62c277c840639bf53ce4f8b8'
    });
  }
  catch (error) {
    console.error(`we encountered ${error}`);
  }
  finally {
    client.close();
  }
});

// test cases

describe('POST /register -> if email and username is given', () => {
  test('should register a user', async () => {
    let registeredUser = await request(app)
      .post('/admin/auth/register')
      .send({
        'username':'Daija_Schuppe',
        'password':'FKwgzOBeRGxUFj1',
        'email':'Domingo.Tillman24@hotmail.com',
        'name':'Curtis Gutkowski',
        'shippingAddress':[{
          '_id':false,
          'pincode':'Buckinghamshire',
          'address1':'drive',
          'address2':'primary',
          'landmark':'Profound',
          'city':'monetize',
          'isDefault':false,
          'state':'back-end',
          'addressType':'generating',
          'fullName':'Investment',
          'mobile':620,
          'addressNo':798
        }],
        'wishlist':[{
          '_id':false,
          'productId':'Wooden'
        }],
        'userType':authConstant.USER_TYPES.Admin,
        'mobileNo':'(261) 490-5813',
        'addedBy':insertedUser.insertedId,
        'updatedBy':insertedUser.insertedId
      });
    
    expect(registeredUser.statusCode).toBe(200);
    expect(registeredUser.body.status).toBe('SUCCESS');
    expect(registeredUser.body.data).toMatchObject({ id: expect.any(String) });
  });
});

describe('POST /login -> if username and password is correct', () => {
  test('should return user with authentication token', async () => {
    let user = await request(app)
      .post('/admin/auth/login')
      .send(
        {
          username: 'Daija_Schuppe',
          password: 'FKwgzOBeRGxUFj1'
        }
      );
      
    expect(user.statusCode).toBe(200);
    expect(user.body.status).toBe('SUCCESS');
    expect(user.body.data).toMatchObject({
      id: expect.any(String),
      token: expect.any(String)
    }); 
  });
});

describe('POST /login -> if username is incorrect', () => {
  test('should return unauthorized status and user not exists', async () => {
    let user = await request(app)
      .post('/admin/auth/login')
      .send(
        {
          username: 'wrong.username',
          password: 'FKwgzOBeRGxUFj1'
        }
      );

    expect(user.statusCode).toBe(400);
    expect(user.body.status).toBe('BAD_REQUEST');
  });
});

describe('POST /login -> if password is incorrect', () => {
  test('should return unauthorized status and incorrect password', async () => {
    let user = await request(app)
      .post('/admin/auth/login')
      .send(
        {
          username: 'Daija_Schuppe',
          password: 'wrong@password'
        }
      );

    expect(user.statusCode).toBe(400);
    expect(user.body.status).toBe('BAD_REQUEST');
  });
});

describe('POST /login -> if username or password is empty string or has not passed in body', () => {
  test('should return bad request status and insufficient parameters', async () => {
    let user = await request(app)
      .post('/admin/auth/login')
      .send({});

    expect(user.statusCode).toBe(400);
    expect(user.body.status).toBe('BAD_REQUEST');
  });
});

describe('POST /forgot-password -> if email has not passed from request body', () => {
  test('should return bad request status and insufficient parameters', async () => {
    let user = await request(app)
      .post('/admin/auth/forgot-password')
      .send({ email: '' });

    expect(user.statusCode).toBe(422);
    expect(user.body.status).toBe('VALIDATION_ERROR');
  });
});

describe('POST /forgot-password -> if email passed from request body is not available in database ', () => {
  test('should return record not found status', async () => {
    let user = await request(app)
      .post('/admin/auth/forgot-password')
      .send({ 'email': 'unavailable.email@hotmail.com', });

    expect(user.statusCode).toBe(200);
    expect(user.body.status).toBe('RECORD_NOT_FOUND');
  });
});

describe('POST /forgot-password -> if email passed from request body is valid and OTP sent successfully', () => {
  test('should return success message', async () => {
    let user = await request(app)
      .post('/admin/auth/forgot-password')
      .send({ 'email':'Domingo.Tillman24@hotmail.com', });

    expect(user.statusCode).toBe(200);
    expect(user.body.status).toBe('SUCCESS');
  });
});

describe('POST /validate-otp -> OTP is sent in request body and OTP is correct', () => {
  test('should return success', () => {
    return request(app)
      .post('/admin/auth/login')
      .send(
        {
          username: 'Daija_Schuppe',
          password: 'FKwgzOBeRGxUFj1'
        }).then(login => () => {
        return request(app)
          .get(`/admin/user/${login.body.data.id}`)
          .set({
            Accept: 'application/json',
            Authorization: `Bearer ${login.body.data.token}`
          }).then(foundUser => {
            return request(app)
              .post('/admin/auth/validate-otp')
              .send({ 'otp': foundUser.body.data.resetPasswordLink.code, }).then(user => {
                expect(user.statusCode).toBe(200);
                expect(user.body.status).toBe('SUCCESS');
              });
          });
      });
  });
});

describe('POST /validate-otp -> if OTP is incorrect or OTP has expired', () => {
  test('should return invalid OTP', async () => {
    let user = await request(app)
      .post('/admin/auth/validate-otp')
      .send({ 'otp': '12334' });
    expect(user.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(user.body.status).toBe('BAD_REQUEST');
    expect(user.statusCode).toBe(400);
  });
});

describe('POST /validate-otp -> if request body is empty or OTP has not been sent in body', () => {
  test('should return insufficient parameter', async () => {
    let user = await request(app)
      .post('/admin/auth/validate-otp')
      .send({});

    expect(user.statusCode).toBe(400);
    expect(user.body.status).toBe('BAD_REQUEST');
  });
});

describe('PUT /reset-password -> code is sent in request body and code is correct', () => {
  test('should return success', () => {
    return request(app)
      .post('/admin/auth/login')
      .send(
        {
          username: 'Daija_Schuppe',
          password: 'FKwgzOBeRGxUFj1'
        }).then(login => () => {
        return request(app)
          .get(`/admin/user/${login.body.data.id}`)
          .set({
            Accept: 'application/json',
            Authorization: `Bearer ${login.body.data.token}`
          }).then(foundUser => {
            return request(app)
              .put('/admin/auth/validate-otp')
              .send({
                'code': foundUser.body.data.resetPasswordLink.code,
                'newPassword':'newPassword'
              }).then(user => {
                  
                expect(user.statusCode).toBe(200);
                expect(user.body.status).toBe('SUCCESS');
              });
          });
      });
  });
});

describe('PUT /reset-password -> if request body is empty or code/newPassword is not given', () => {
  test('should return insufficient parameter', async () => {
    let user = await request(app)
      .put('/admin/auth/reset-password')
      .send({});
  
    expect(user.statusCode).toBe(400);
    expect(user.body.status).toBe('BAD_REQUEST');
  });
});

describe('PUT /reset-password -> if code is invalid', () => {
  test('should return invalid code', async () => {
    let user = await request(app)
      .put('/admin/auth/reset-password')
      .send({
        'code': '123',
        'newPassword': 'testPassword'
      });

    expect(user.statusCode).toBe(400);
    expect(user.body.status).toBe('BAD_REQUEST');
  });
});

afterAll(function (done) {
  db.connection.db.dropDatabase(function () {
    db.connection.close(function () {
      done();
    });
  });
});
