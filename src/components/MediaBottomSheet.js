import React from 'react';
import { Text, View, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Button } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'reanimated-bottom-sheet';
import MediaPlayScreen from './MediaPlayScreen';
import layout from '../constants/Layout';
import { Audio } from 'expo-av';
import Spinner from './Spinner';
import { connect } from 'react-redux';
import { updateMedia } from '../actions/media';
import { toggleBottomTabs } from '../actions/showBottomTabs';
import { PRIMARY_FONT_COLOR } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { throwIfAudioIsDisabled } from 'expo-av/build/Audio/AudioAvailability';

const { height } = layout.window;
class MediaBottomSheet extends React.Component {
    constructor(props) {
        super(props);
        this.audio = null;
        this.state = {
            isLoaded: false,
            isLoading: false,
            isPlaying: false,
            audioDuration: 0,
            audioPosition: 0,
            isBuffering: true,
            isRepeating: false,
            isRandom: false,
            listRandom: [],
            positionInListRandom: -1,
        };
        this._onPlaybackStatusUpdate = this._onPlaybackStatusUpdate.bind(this);

        this.bottomSheetRef = React.createRef();
    }
    /**
    @Desc
    * When component is first mounted
    ** Audio sound is initialized
    ** Basic setup/configuration for android and ios
    ** Wiring _onPlaybackStatusUpdate function with audio object
        _onPlaybackStatusUpdate is called in regular interval updating audio status
          i.e. isPlaying, isBuffering, isLoading, positions etc
    ** Load new sound invoking loadNewAudio() function
    */
    async componentDidMount() {
        this.audio = new Audio.Sound();
        Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false,
        });

        this.audio.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
        await this.loadNewAudio();
        this.audio.playAsync();
    }

    async componentDidUpdate(prevProps, prevState) {
        const { media } = this.props;
        if (prevProps.media !== media) {
            if (this.state.isLoaded) await this.audio.unloadAsync();

            if (await this.loadNewAudio()) this.audio.playAsync();
        }
    }

    /*
     * Unload audio when component unmounts
     */
    componentWillUnmount() {
        this.audio.unloadAsync();
    }

    /**
    @Desc
    * Only one audio will have be loaded at a time, hence if one audio is already in a loading process
    * Another audio has to wait for previous audio to be finished loading first
  
    - If no audio is currently in loading process
      - set isLoaded state to true
      - load audio
        - Check is audio source has been updated
        - i.e. if new audio has been loaded while the previous audio was already in loading process
          - Load new audio
  
  
    @return {boolean}
    true or fasle
    returning true will auto play audio as used in componentDidMount() function
    */
    loadNewAudio = async () => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
            const { source } = this.props.media.currentlyPlaying;
            await this.audio.loadAsync({ uri: source });

            /*
             * If playback source has been updated already
             * Happens when user changes another song while one is already in loading process
             */
            const updatedSrc = this.props.media.currentlyPlaying.source;
            if (source !== updatedSrc) {
                await this.audio.unloadAsync();
                await this.audio.loadAsync({ uri: updatedSrc });
            }
            this.setState({ isLoading: false });
            return true;
        } else {
            return false;
        }
    };

    /*
     * Is wired with audio object to be called in a regular interval
     * Updating audio status in real time
     */
    _onPlaybackStatusUpdate({
        isPlaying,
        isBuffering,
        positionMillis,
        durationMillis,
        isLoaded,
        didJustFinish,
    }) {
        if (didJustFinish) return this.playNext();
        this.setState({
            isLoaded,
            isPlaying,
            isBuffering,
            audioPosition: positionMillis || 0,
            audioDuration: durationMillis || 1,
        });
    }

    /*
     * Returns current audio seek slider positon
     */
    _getSeekSliderPosition = () => {
        if (
            this.audio != null &&
            this.state.audioPosition != null &&
            this.state.audioDuration != null
        ) {
            return this.state.audioPosition / this.state.audioDuration;
        }
        return 0;
    };

    /*
     * Plays audio from seek position
     */
    _onSeekSliderSlidingComplete = (value) => {
        if (this.audio != null) {
            const seekPosition = value * this.state.audioDuration;
            this.audio.playFromPositionAsync(seekPosition);
        }
    };

    /*
     * Plays or pause current audio
     */
    onPlayPausePressed = async () => {
        if (this.audio != null) {
            if (this.state.isPlaying) {
                this.audio.pauseAsync();
            } else {
                this.audio.playAsync();
            }
        }
    };

    /*
    * Fetches current playing songs index number from mediaList array
    * if next index is lesser than media.length
      Update currentlyPlaying audio
    */
    playNext = async () => {
        const { media, updateMedia } = this.props;
        const { mediaList, currentlyPlaying } = media;
        const { title } = currentlyPlaying;
        const { listRandom } = this.state;

        const index = mediaList.findIndex((x) => x.title === title);
        const positionRandom = listRandom.indexOf(index);
        if (!this.state.isRepeating) {
            if (!this.state.isRandom) {
                if (index + 1 < mediaList.length)
                    updateMedia({ ...media, currentlyPlaying: mediaList[index + 1] });
                if (index + 1 === mediaList.length)
                    updateMedia({ ...media, currentlyPlaying: mediaList[0] });
            } else {
                if (positionRandom + 1 < mediaList.length)
                    updateMedia({ ...media, currentlyPlaying: mediaList[listRandom[positionRandom + 1]] });
                if (positionRandom + 1 === mediaList.length)
                    updateMedia({ ...media, currentlyPlaying: mediaList[listRandom[0]] });
            }
        } else {
            updateMedia({ ...media, currentlyPlaying: mediaList[index] });
        }
    };

    /*
    * Fetches current playing songs index number from mediaList array
    * if previous index is greater than or equal to 0
      Update currentlyPlaying audio
    */
    playPrevious = async () => {
        const { audioPosition } = this.state;

        /**
        * If audio position is greater than 3 sec
          - Play from start
          Else
          - Play Previous audio
        */
        if (audioPosition > 3000) {
            this.audio.playFromPositionAsync(0);
        } else {
            const { media, updateMedia } = this.props;
            const { mediaList, currentlyPlaying } = media;
            const { title } = currentlyPlaying;
            const { listRandom } = this.state;

            const index = mediaList.findIndex((x) => x.title === title);
            const positionRandom = listRandom.indexOf(index);
            if (!this.state.isRepeating) {
                if (!this.state.isRandom) {
                    if (index - 1 >= 0)
                        updateMedia({ ...media, currentlyPlaying: mediaList[index - 1] });
                    if (index === 0)
                        updateMedia({ ...media, currentlyPlaying: mediaList[mediaList.length - 1] });
                } else {
                    if (positionRandom - 1 >= 0)
                        updateMedia({ ...media, currentlyPlaying: mediaList[listRandom[positionRandom - 1]] });
                    if (positionRandom === 0)
                        updateMedia({ ...media, currentlyPlaying: mediaList[listRandom[listRandom.length - 1]] });
                }
            } else {
                updateMedia({ ...media, currentlyPlaying: mediaList[index] });
            }
        }
    };
    playRepeat = async () => {
        var { isRepeating } = this.state;
        this.setState({ isRepeating: !isRepeating });
    }
    playRandom = async () => {
        this.randomNumbers();
        var { isRandom } = this.state;
        this.setState({
            isRandom: !isRandom,
        });
    }
    randomNumbers = () => {
        const { media } = this.props;
        const { mediaList } = media;
        const len = mediaList.length;
        var nums = [];
        for (var i = 0; i < len; i++)
            nums.push(i);
        var ranNums = [],
            i = nums.length,
            j = 0;

        while (i--) {
            j = Math.floor(Math.random() * (i + 1));
            ranNums.push(nums[j]);
            nums.splice(j, 1);
        }
        this.setState({ listRandom: ranNums });
    }
    content = () => {
        const {
            isLoaded,
            isPlaying,
            isBuffering,
            audioDuration,
            audioPosition,
            isRepeating,
            isRandom,
        } = this.state;
        const { media } = this.props;
        return (
            <LinearGradient
                colors={['#016c52', '#097754', '#0e4331', '#121212']}
                style={{
                    height,
                    paddingHorizontal: 15,
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                }}
            >
                <MediaPlayScreen
                    bottomSheetRef={this.bottomSheetRef}
                    _getSeekSliderPosition={this._getSeekSliderPosition}
                    _onSeekSliderSlidingComplete={this._onSeekSliderSlidingComplete}
                    isLoaded={isLoaded}
                    isPlaying={isPlaying}
                    isRepeating={isRepeating}
                    isRandom={isRandom}
                    isBuffering={isBuffering}
                    audioDuration={audioDuration}
                    audioPosition={audioPosition}
                    media={media}
                    onPlayPausePressed={this.onPlayPausePressed}
                    playNext={this.playNext}
                    playPrevious={this.playPrevious}
                    playRepeat={this.playRepeat}
                    playRandom={this.playRandom}
                />
            </LinearGradient>
        );
    };

    render() {
        const { isLoaded, isPlaying, isBuffering } = this.state;
        const { info, currentlyPlaying } = this.props.media;
        const { title, singer } = currentlyPlaying;
        return (
            <>
                <View style={{ backgroundColor: '#2a2a2a', width: '100%', height: 56 }}>
                    <TouchableOpacity
                        transparent
                        onPress={() => this.bottomSheetRef.current.snapTo(0)}
                        s
                        tyle={{ flex: 1 }}
                    >
                        <View
                            style={{
                                justifyContent: 'space-between',
                                flexDirection: 'row',
                                height: '100%',
                            }}
                        >
                            <View
                                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                            >
                                <Image
                                    style={{
                                        shadowOffset: { width: 10, height: 10 },
                                        shadowColor: 'black',
                                        shadowOpacity: 1.0,
                                        height: 56,
                                        width: 56,
                                        marginRight: 10,
                                    }}
                                    source={{ uri: info.cover }}
                                />
                                <Text
                                    style={{ fontSize: 16, color: PRIMARY_FONT_COLOR, flex: 1 }}
                                    numberOfLines={1}
                                >
                                    {' '}
                                    {title}{' '}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginRight: 15,
                                }}
                            >
                                {isBuffering && <Spinner />}

                                <Button
                                    transparent
                                    onPress={this.onPlayPausePressed}
                                    style={{
                                        justifyContent: 'center',
                                        borderRadius: 48 / 2,
                                        height: 48,
                                        width: 48,
                                    }}
                                    disabled={!isLoaded}
                                >
                                    <Ionicons
                                        style={[
                                            !isLoaded && { opacity: 0.3 },
                                            { color: PRIMARY_FONT_COLOR },
                                        ]}
                                        size={36}
                                        name={isPlaying ? 'ios-pause' : 'ios-play'}
                                    />
                                </Button>
                                <Button
                                    transparent
                                    disabled={!isLoaded}
                                    style={{
                                        justifyContent: 'center',
                                        borderRadius: 48 / 2,
                                        height: 48,
                                        width: 48,
                                    }}
                                    onPress={this.playNext}
                                >
                                    <Ionicons
                                        style={[!isLoaded && { opacity: 0.3 },
                                            { color: PRIMARY_FONT_COLOR },]}
                                        size={34}
                                        name="ios-skip-forward"
                                    />
                                </Button>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <BottomSheet
                    onOpenStart={() => {
                        this.props.toggleBottomTabs(false);
                        StatusBar.setHidden(true);
                    }}
                    onCloseEnd={() => {
                        this.props.toggleBottomTabs(true);
                        StatusBar.setHidden(false);
                    }}
                    ref={this.bottomSheetRef}
                    snapPoints={['100%', 0]}
                    renderHeader={this.content}
                    initialSnap={1}
                />
            </>
        );
    }
}

function mapStateToProps({ media }) {
    return { media };
}

export default connect(mapStateToProps, { updateMedia, toggleBottomTabs })(
    MediaBottomSheet
);
