import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, PanResponder, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onComplete: () => void;
  busy?: boolean;
}

const THUMB = 60;
const PADDING = 5;
const TRACK_H = THUMB + PADDING * 2;

export function SlideToAction({
  label,
  hint = 'Slide to confirm',
  icon = 'call',
  onComplete,
  busy,
}: Props) {
  const trackW = useRef(0);
  const x = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const arrowPulse = useRef(new Animated.Value(0)).current;
  const [committed, setCommitted] = useState(false);
  const [dragging, setDragging] = useState(false);

  // looping shimmer + chevron pulse while idle
  useEffect(() => {
    if (dragging || committed || busy) return;
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowPulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    shimmerLoop.start();
    arrowLoop.start();
    return () => {
      shimmerLoop.stop();
      arrowLoop.stop();
      shimmer.setValue(0);
      arrowPulse.setValue(0);
    };
  }, [dragging, committed, busy, shimmer, arrowPulse]);

  const reset = () => {
    Animated.spring(x, { toValue: 0, useNativeDriver: false, friction: 6, tension: 80 }).start();
  };

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4,
      onPanResponderGrant: () => {
        setDragging(true);
        x.setOffset((x as unknown as { _value: number })._value);
      },
      onPanResponderMove: (_, g) => {
        const max = Math.max(0, trackW.current - THUMB - PADDING * 2);
        const next = Math.min(Math.max(g.dx, 0), max);
        x.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        x.flattenOffset();
        setDragging(false);
        const max = Math.max(0, trackW.current - THUMB - PADDING * 2);
        if (g.dx > max * 0.72) {
          Animated.timing(x, { toValue: max, duration: 140, useNativeDriver: false }).start(() => {
            setCommitted(true);
            onComplete();
            setTimeout(() => {
              setCommitted(false);
              reset();
            }, 500);
          });
        } else {
          reset();
        }
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        reset();
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    trackW.current = e.nativeEvent.layout.width;
  };

  const maxX = Math.max(1, (trackW.current || 1) - THUMB - PADDING * 2);

  const fillWidth = x.interpolate({
    inputRange: [0, maxX],
    outputRange: [THUMB + PADDING * 2, trackW.current || THUMB + PADDING * 2],
    extrapolate: 'clamp',
  });

  const labelOpacity = x.interpolate({
    inputRange: [0, maxX * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, trackW.current || 320],
  });

  const arrowOpacity = arrowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const arrowTranslate = arrowPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  const thumbScale = x.interpolate({
    inputRange: [0, maxX],
    outputRange: [1, 1.05],
    extrapolate: 'clamp',
  });

  return (
    <View
      onLayout={onLayout}
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        height: TRACK_H,
        elevation: 6,
        shadowColor: '#059669',
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      {/* Track background (soft mint) */}
      <LinearGradient
        colors={['#A7F3D0', '#6EE7B7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />

      {/* Emerald fill that grows as user drags */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: fillWidth,
        }}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Shimmer band moving across when idle */}
      {!dragging && !committed && !busy ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 80,
            transform: [{ translateX: shimmerX }, { skewX: '-20deg' }],
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
      ) : null}

      {/* Label group (center) */}
      <View className="flex-1 flex-row items-center justify-center px-4">
        <Animated.View style={{ opacity: labelOpacity, alignItems: 'center' }}>
          <Text className="text-emerald-900/70 text-[10px] font-bold uppercase tracking-[2px]">
            {hint}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-emerald-900 text-base font-bold">{label}</Text>
            <Animated.View
              style={{
                marginLeft: 8,
                opacity: arrowOpacity,
                transform: [{ translateX: arrowTranslate }],
              }}
            >
              <Ionicons name="chevron-forward" size={16} color="#065F46" />
              <View style={{ position: 'absolute', left: 6 }}>
                <Ionicons name="chevron-forward" size={16} color="rgba(6,95,70,0.5)" />
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* Draggable thumb */}
      <Animated.View
        {...responder.panHandlers}
        style={{
          position: 'absolute',
          top: PADDING,
          left: PADDING,
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateX: x }, { scale: thumbScale }],
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <View
          style={{
            width: THUMB - 12,
            height: THUMB - 12,
            borderRadius: (THUMB - 12) / 2,
            backgroundColor: committed ? '#10B981' : '#ECFDF5',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={committed ? 'checkmark' : busy ? 'hourglass-outline' : icon}
            size={24}
            color={committed ? '#fff' : '#059669'}
          />
        </View>
      </Animated.View>
    </View>
  );
}
