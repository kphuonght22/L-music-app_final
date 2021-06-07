import React, { Component } from 'react';
import { StyleSheet, Text, Image, View, FlatList, TouchableOpacity } from 'react-native';
import {
    Container,
    Header,
    Body,
    Content,
    Left,
    Button,
    Icon,
    List,
    ListItem,
} from 'native-base';
import {
    PRIMARY_COLOR,
    FADE_COLOR,
    PRIMARY_BACKGROUND_COLOR,
    PRIMARY_FONT_COLOR,
} from '../constants/Colors';
import { updateMedia } from '../actions/media';
import { connect } from 'react-redux';
import DATA from '../api/results.json';

class BookViewScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listSong: []
        }
    }
    render() {
        const {
            title,
            cover,
            audios,
            author,
        } = this.props.navigation.state.params;
        //console.log(this.props.navigation.state.params.Boxid, `- ${title}`);
        return (
            <Container style={{ backgroundColor: PRIMARY_BACKGROUND_COLOR }}>
                <Header transparent iosBarStyle={'light-content'}>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.pop()}>
                            <Icon name="arrow-back"
                                style={{
                                    marginLeft: 5,
                                    fontSize: 26,
                                    color: PRIMARY_FONT_COLOR,
                                }}
                            />
                        </Button>
                    </Left>
                    <Body />
                </Header>
                <Content
                    style={{ marginHorizontal: 15 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={{
                            alignItems: 'center',
                            paddingBottom: 15,
                            marginBottom: 15,
                        }}
                    >
                        <View
                            style={{
                                marginBottom: 20,
                                height: 300,
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <Image
                                resizeMode={'contain'}
                                style={[{ height: '100%', width: '100%' }, styles.image]}
                                source={{ uri: cover }}
                            />
                        </View>

                        <Text style={{ color: FADE_COLOR }}>{author}</Text>
                        <Text
                            style={{
                                fontSize: 24,
                                marginVertical: 8,
                                color: PRIMARY_FONT_COLOR,
                            }}
                        >
                            {title}
                        </Text>

                        <Button
                            onPress={() =>
                                this.props.updateMedia({
                                    info: {
                                        author,
                                        title,
                                        cover,
                                    },
                                    mediaList: audios,
                                    currentlyPlaying: audios[0],
                                })
                            }
                            style={{
                                backgroundColor: PRIMARY_COLOR,
                                paddingHorizontal: 36,
                                paddingVertical: 10,
                                marginVertical: 10,
                                borderRadius: 30,
                            }}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>PLAY</Text>
                        </Button>
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18, marginTop: 18}}>Danh sách bài hát</Text>
                        <List style={{ marginTop: 16, flex: 1}}>
                            {audios.map((song, index) => (
                                <ListItem key={index}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            this.props.updateMedia({
                                                info: {
                                                    author,
                                                    title,
                                                    cover,
                                                },
                                                mediaList: audios,
                                                currentlyPlaying: audios[index],
                                            })
                                        }
                                    >
                                        <View style={styles.viewListSong}>
                                            <View>
                                                <Text numberOfLines={1} style={styles.textTitle}>
                                                    {song.title}
                                                </Text>
                                                <Text style={{color: 'grey', marginTop: 4, fontSize: 10}}>
                                                    {song.singer}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </ListItem>
                            ))}
                        </List>
                    </View>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    image: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
    },
    starWrapper: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    starActiveIcon: {
        color: '#feb220',
        margin: 4,
    },
    starIcon: {
        color: '#d9d9d9',
        margin: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    viewListSong: {
        marginHorizontal: 16,
        flexDirection: 'row', 
        alignItems: 'center',
    },
    textTitle: {
        color: "white",
        fontSize: 18,
    }
});

export default connect(null, { updateMedia })(BookViewScreen);
