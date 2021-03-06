import React, { useState } from 'react';
import { StyleSheet, Text, Image, View, Slider, Alert } from 'react-native';
import { Button, Title } from 'native-base';
import { Ionicons, MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import {
    PRIMARY_COLOR,
    PRIMARY_FONT_COLOR,
    FADE_COLOR,
} from '../constants/Colors';
import FlipCard from 'react-native-flip-card';
import MediaList from './MediaList';

export default (props) => {
    const [flip, setFlip] = useState(false);

    function msToTime(ms) {
        const h = Math.floor(ms / 1000 / 60 / 60);
        const m = Math.floor((ms / 1000 / 60 / 60 - h) * 60);
        const s = (
            '0' + Math.floor(((ms / 1000 / 60 / 60 - h) * 60 - m) * 60)
        ).slice(-2);
        return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    }

    const {
        isPlaying,
        isLoaded,
        isRepeating,
        isRandom,
        isBuffering,
        audioPosition,
        audioDuration,
        media,
        _getSeekSliderPosition,
        _onSeekSliderSlidingComplete,
        onPlayPausePressed,
        playNext,
        playPrevious,
        playRepeat,
        playRandom,
        bottomSheetRef,
    } = props;
    const {
        info: { title, author, cover },
        currentlyPlaying,
    } = media;

    return (
        <FlipCard
            flip={flip}
            friction={6}
            perspective={1000}
            flipHorizontal={true}
            flipVertical={false}
            clickable={false}
        >
            <View>{faceSize()}</View>
            <View>{backSide()}</View>
        </FlipCard>
    );

    function faceSize() {
        return (
            <View>
                <View
                    style={{
                        marginTop: 22,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                    }}
                >
                    <Button
                        onPress={() => bottomSheetRef.current.snapTo(1)}
                        style={{ padding: 12, height: 35 }}
                        transparent
                    >
                        <Ionicons
                            name="ios-arrow-down"
                            size={28}
                            style={{ color: PRIMARY_FONT_COLOR }}
                        ></Ionicons>
                    </Button>
                    <Text
                        style={{
                            textAlign: "center",
                            paddingVertical: 12,
                            width: "60%",
                            fontWeight: 'bold',
                            fontSize: 16,
                            color: PRIMARY_FONT_COLOR,
                        }}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    <Button
                        onPress={() => setFlip(true)}
                        style={{ padding: 12, height: 35 }}
                        transparent
                    >
                        <Ionicons
                            name="ios-list"
                            size={24}
                            style={{ color: PRIMARY_FONT_COLOR }}
                        ></Ionicons>
                    </Button>
                </View>
                <View
                    style={{
                        alignItems: 'center',
                        marginTop: 20,
                        marginBottom: 50,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 5,
                        },
                        shadowOpacity: 0.36,
                        shadowRadius: 6.68,
                        elevation: 4,
                    }}
                >
                    <Image source={{ uri: cover }} style={styles.image} />
                </View>
                <View style={{ alignItems: "flex-start", marginBottom: 20 }}>
                    <Text style={{ color: FADE_COLOR, fontSize: 22, fontWeight: "bold" }}>{currentlyPlaying.title}</Text>
                    <Text style={{ color: PRIMARY_COLOR, marginVertical: 4, fontSize: 16 }}>
                        {currentlyPlaying.singer}
                    </Text>
                </View>
                
                <View>
                    <Slider
                        value={_getSeekSliderPosition()}
                        onSlidingComplete={_onSeekSliderSlidingComplete}
                    />
                    <View
                        style={{ justifyContent: 'space-between', flexDirection: 'row' }}
                    >
                        <Text style={styles.soundStamp}>
                            {msToTime(audioPosition) || '0.00'}
                        </Text>
                        <Text style={styles.soundStamp}>
                            - {msToTime(audioDuration) || '0.00'}
                        </Text>
                    </View>
                </View>

                <View 
                    style={{ 
                        alignItems: 'center',
                        marginVertical: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between', }}
                >
                    <Button
                        transparent
                        disabled={!isLoaded}
                        style={styles.controlButton}
                        onPress={playRandom}
                    >
                        <FontAwesome
                            style={[!isLoaded && styles.disabled]}
                            size={22}
                            color={isRandom ? "green" : "white"}
                            name="random"
                        />
                    </Button>
                    <View
                        style={{
                            flexDirection: 'row',
                            width: 200,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            transparent
                            disabled={!isLoaded}
                            style={styles.controlButton}
                            onPress={playPrevious}
                        >
                            <Ionicons
                                style={[!isLoaded && styles.disabled, styles.controlIcons]}
                                size={34}
                                name="ios-skip-backward"
                            />
                        </Button>
                        <Button
                            transparent
                            onPress={onPlayPausePressed}
                            style={{ height: 70 }}
                            disabled={!isLoaded}
                        >
                            <MaterialIcons
                                style={[!isLoaded && styles.disabled, styles.controlIcons]}
                                size={60}
                                name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
                            />
                        </Button>
                        <Button
                            transparent
                            disabled={!isLoaded}
                            style={styles.controlButton}
                            onPress={playNext}
                        >
                            <Ionicons
                                style={[!isLoaded && styles.disabled, styles.controlIcons]}
                                size={34}
                                name="ios-skip-forward"
                            />
                        </Button>
                    </View>
                    <Button
                        transparent
                        disabled={!isLoaded}
                        style={styles.controlButton}
                        onPress={playRepeat}
                    >
                        <MaterialIcons
                            style={[!isLoaded && styles.disabled]}
                            size={24}
                            color={isRepeating ? "green" : "white"}
                            name={isRepeating ? "repeat-one" : "repeat"}
                        />
                    </Button>
                </View>

            </View>
        );
    }

    function backSide() {
        return (
            <View>
                <View
                    style={{
                        marginVertical: 16,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                    }}
                >
                    <Button
                        onPress={() => bottomSheetRef.current.snapTo(1)}
                        style={{ padding: 6, height: 34 }}
                        transparent
                    >
                        <Ionicons
                            name="ios-arrow-down"
                            size={28}
                            style={{ color: PRIMARY_FONT_COLOR }}
                        ></Ionicons>
                    </Button>
                    <Title style={{ color: PRIMARY_FONT_COLOR }}>Chapters</Title>
                    <Button
                        onPress={() => setFlip(false)}
                        style={{ padding: 6, height: 34 }}
                        transparent
                    >
                        <AntDesign
                            name="back"
                            size={24}
                            style={{ color: PRIMARY_FONT_COLOR }}
                        ></AntDesign>
                    </Button>
                </View>
                <MediaList setFlip={setFlip} />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    image: {
        marginBottom: 8,
        width: 300,
        height: 300,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
    },
    controlButton: {
        height: 42,
        width: 42,
        borderRadius: 42 / 2,
        justifyContent: 'center',
        padding: 6,
    },
    controlIcons: {
        color: PRIMARY_FONT_COLOR,
    },
    soundStamp: {
        color: FADE_COLOR,
        fontSize: 12,
    },
    disabled: {
        opacity: 0.3,
    },
    starWrapper: {
        flexDirection: 'row',
    },
    starActiveIcon: {
        color: '#feb220',
        margin: 4,
    },
    starIcon: {
        color: '#d9d9d9',
        margin: 4,
    },
});
