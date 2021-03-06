import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Button,
  Alert,
  PanResponder,
  Share,
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = (state) => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites,
  };
};
const mapDispatchToProps = (dispatch) => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment)),
});
function RenderDish(props) {
  const dish = props.dish;
  // handleViewRef = (ref) => (this.view = ref);

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200) return true;
    else return false;
  };
  const recognizeRightDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx > 200) return true;
    else return false;
  };
  const shareDish = (title, message, url) => {
    Share.share({
        title: title,
        message: title + ': ' + message + ' ' + url,
        url: url
    },{
        dialogTitle: 'Share ' + title
    })
}
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    // onPanResponderGrant: () => {
    //   this.view
    //     .rubberBand(1000)
    //     .then((endState) =>
    //       console.log(endState.finished ? "finished" : "cancelled")
    //     );
    // },
    onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState))
        Alert.alert(
          "Add Favorite",
          "Are you sure you wish to add " + dish.name + " to favorite?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => {
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress();
              },
            },
          ],
          { cancelable: false }
        );
      else if (recognizeRightDrag(gestureState)) props.toggleModal();

      return true;
    },
  });
  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        // ref={this.handleViewRef}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={style.rowContainer}>
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={() => props.toggleModal()}
            />
            <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={style.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10, paddingBottom: 30 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating
          imageSize={15}
          readonly
          startingValue={item.rating}
          style={{ margin: 15 }}
        />
        <Text style={{ fontSize: 15 }}>
          {"-- " + item.author + ",\n" + item.date}{" "}
        </Text>
      </View>
    );
  };
  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class Dishdetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: [],
      showModal: false,
      rating: 5,
      author: "",
      comment: "",
    };
  }

  markFavorite = (dishId) => {
    this.props.postFavorite(dishId);
  };

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }
  handleSubmit(dishId) {
    console.log(dishId);
    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.author,
      this.state.comment
    );
    this.toggleModal();
  }

  static navigationOptions = {
    title: "Dish Details",
    headerStyle: {
      backgroundColor: "blue",
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      color: "#fff",
    },
  };

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some((el) => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={() => this.toggleModal()}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            (comment) => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => this.toggleModal()}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={style.modal}>
            <Rating
              ratingCount={5}
              startingValue={5}
              minValue={1}
              onFinishRating={(rate) => this.setState({ rating: rate })}
            />
            <Input
              type="text"
              placeholder="   Author"
              defaultValue={this.state.author}
              leftIcon={{ type: "font-awesome", name: "user" }}
              onChangeText={(value) => this.setState({ author: value })}
            />
            <Input
              type="text"
              placeholder="   Comment"
              defaultValue={this.state.comment}
              onChangeText={(value) => this.setState({ comment: value })}
              leftIcon={{ type: "font-awesome", name: "comment" }}
            />
            <View style={{ padding: 10 }}>
              <Button
                onPress={() => this.handleSubmit(dishId)}
                color="#512DA8"
                title="Submit"
              />
            </View>
            <View style={{ padding: 10 }}>
              <Button
                onPress={() => {
                  this.toggleModal();
                }}
                color="#AAA"
                title="Cancel"
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
const style = {
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "center",
    margin: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    margin: 10,
  },
};
