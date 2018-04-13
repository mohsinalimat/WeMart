import Header from './components/header';
import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import SampleImage from './images/canned-goods.jpg'
import HorizontalScroll from './components/HorizontalScroll';
import {DynamoDB} from "aws-sdk/index";

var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

var id;
var cognitoUser;
var email;
var dynamoDB;

class Item extends Component {

	constructor(props) {
    	super(props);

    	this.state = {
    		item: {}
    	}
    	const queryParams = new URLSearchParams(this.props.location.search);
    	id = queryParams.get('id')

    	this.getItem()
    	this.getCurrentUser()
	}

	initializeDB() {
		if(process.env.NODE_ENV === 'development'){
	        dynamodb = require('./db').db;
	    } else {
	        dynamodb = new DynamoDB({
	            region: "us-west-1",
	            credentials: {
	                accessKeyId: process.env.REACT_APP_DB_accessKeyId,
	                secretAccessKey: process.env.REACT_APP_DB_secretAccessKey},
	        });
	    }
	}

	getCurrentUser() {
		// Get poolData
	    var poolData;
	    if(process.env.NODE_ENV === 'development'){
	        poolData = require('./poolData').poolData;
	    } else {
	      var poolData = {
	        UserPoolId : process.env.REACT_APP_Auth_UserPoolId,
	        ClientId : process.env.REACT_APP_Auth_ClientId
	      };
	    }
	    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

	    cognitoUser = userPool.getCurrentUser();

	    if (cognitoUser != null) {
	        cognitoUser.getSession(function(err, session) {
	            if (err) {
	                alert(err.message || JSON.stringify(err));
	                return;
	            }
	            console.log('session validity: ' + session.isValid());

	            // NOTE: getSession must be called to authenticate user before calling getUserAttributes
	            cognitoUser.getUserAttributes(function(err, attributes) {
	                if (err) {
	                    console.log(err)
	                } else {
	                	attributes.forEach(function(att){
	                		if(att.Name == 'email') {
	                			email = att.Value
	                		}
	                	});
	                }
	            });
	        });
    	}
	}

	getItem() {
	    
		var params = {
		  Key: {
		   "itemid": {
		     S: id
		    }
		  }, 
		  TableName: "item"
		 };

		dynamodb.getItem(params, function(err, data) {
			if (err) {
		   		console.log(err, err.stack)	
		   	} else { 
		   		this.setState({ item: { itemid: data.Item.itemid.S, name: data.Item.name.S, departmentid: data.Item.departmentid.N, 
		   		image: data.Item.image.S, price: data.Item.price.N, quantity: data.Item.quantity.S, sale: data.Item.sale.N } })
		   	}
		 }.bind(this));
	}

	addToList() {
		if(cognitoUser == null) {
			alert("You need to Sign Up for an Account first.")
		} else {
			alert("Logged in")
		}
	}

	renderPrice() {
		if(this.state.item.sale != 0) {
			return (
				<p style={{marginTop: '5%', color: 'red', fontSize: '1.8em'}}>
					<span style={{color: 'black', textDecoration: 'line-through', webkitTextDecorationColor: 'red'}}>${this.state.item.price}</span>
					&nbsp;&nbsp;${this.state.item.sale}
				</p>
			);
		} else {
			return (
				<p style={{marginTop: '5%', fontSize: '1.8em'}}>
					${this.state.item.price}
				</p>
			);
		}
	}

	render() { 

		if(window.innerWidth < 550) {
			const astext = {
			    background:'none',
			    border:'none',
			    width: '40%',
			    padding:'0',
			    fontSize: '1.2em',
				textAlign: 'center',
			}

			return (
			  <div>
			    <Header />
			    <div style={{
			    	marginTop: '3%',
			    	marginLeft: '25%',
			    	marginRight: '25%',
					width: '50%',
					float: 'left' 
				}}>
			    	<img className="img-responsive" style={{width: '100%', width: '100%'}} src={this.state.item.image} />
			    </div>
			    <div style={{
			    	margin: '3%',
					width: '94%',
					float: 'right',
				}}>

					<h1 style={{marginTop: '0', fontSize: '2em'}}>{this.state.item.name}</h1>
					<p style={{marginTop: '3%', color: 'grey', fontSize: '1.4em'}} >{this.state.item.quantity}</p>
					{this.renderPrice()}
					<select style={{marginTop: '3%', borderColor: '#CCCCCC', webkitAppearance: 'menulist-button', height: '44px', width: '60%'}}>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
					</select>
					<button className="primaryRedWithHover" style={astext} onClick={this.addToList} >
						<i class="fa fa-th-list" style={{width: '20%'}}/>
						Add to List
					</button>
					<button className="primary" style={{marginTop: '3%', height:'46px', width: '100%'}}>Add to Cart</button>
					<HorizontalScroll items={[this.state.item]} title="Similar Items"/>
			    </div>
			  </div>
			);
		} else {
			const astext = {
			    background:'none',
			    border:'none',
			    width: '80px',
			    marginLeft: '10%',
			    padding:'0',
			    fontSize: '1em',
				textAlign: 'center',
			}

			return (
			  <div>
			    <Header />
			    <div style={{
			    	margin: '3%',
					width: '45%',
					height: '500px',
					float: 'left' 
				}}>
			    	<img className="img-responsive" style={{width: '100%', width: '100%'}} src={this.state.item.image} />
			    </div>
			    <div style={{
			    	margin: '3%',
			    	marginLeft: '0%',
					width: '45%',
					height: '500px',
					float: 'right',
				}}>

					<h1 style={{marginTop: '0', fontSize: '2em'}}>{this.state.item.name}</h1>
					<p style={{marginTop: '5%', color: 'grey', fontSize: '1.4em'}} >{this.state.item.quantity}</p>
					{this.renderPrice()}
					<select style={{marginTop: '5%', borderColor: '#CCCCCC', webkitAppearance: 'menulist-button', height: '44px', width: '64px'}}>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
					</select>
					<button className="primary" style={{marginLeft: '5%', height:'46px', width: '40%'}}>Add to Cart</button>
					<button className="primaryRedWithHover" style={astext} onClick={this.addToList} >
						<i class="fa fa-th-list fa-2x" style={{width: '80px'}}/>
						Add to List
					</button>
					<HorizontalScroll items={[this.state.item]} title="Similar Items"/>
			    </div>
			  </div>
		);
	}
  }
}

export default withRouter(Item);