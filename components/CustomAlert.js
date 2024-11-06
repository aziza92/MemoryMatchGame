import React from 'react';
import { Dialog, Portal, Button, Paragraph } from 'react-native-paper';

const CustomAlert = ({ visible, onDismiss, onConfirm, message, confirmText }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => {}} dismissable={false}>
        <Dialog.Title>Notification</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Annuler</Button>
          <Button onPress={onConfirm}>{confirmText}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CustomAlert;
