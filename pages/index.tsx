import { Fragment, ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { Alert, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import { useRouter } from 'next/router'
import axios, { AxiosError } from 'axios'
import Image from 'next/image'
import LoadingButton from '@mui/lab/LoadingButton'
import CloseIcon from '@mui/icons-material/Close'
import { generateId } from '@/util'
import { NextPageContext } from 'next'

export interface LineIssueToken {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token: string;
}

export interface LineProfile {
  userId: string;
  displayName: string;
  statusMessage: string;
  pictureUrl: string;
}

export default function LineLogin() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID
  const state = generateId()
  const scope = 'profile%20openid%20email'
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET
  const callbackUrl = process.env.NEXT_PUBLIC_MY_URL
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}&scope=${scope}&nonce=09876xyz`

  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState('');
  const [code, setCode] = useState('')
  const [issueToken, setIssueToken] = useState<LineIssueToken | undefined>()
  const [lineProfile, setLineProfile] = useState<LineProfile | undefined>()

  useEffect(() => {
    if (router.isReady && router.query.code) {
      setCode(router.query.code as string);
    }
  }, [router.isReady, router.query])

  const lineIssueToken = async () => {
    try {
      setLoading(true)
      const res = await axios.post('https://api.line.me/oauth2/v2.1/token', {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      const issueTokenRes = res?.data
      setIssueToken(issueTokenRes)
      const res2 = await axios.get('https://api.line.me/v2/profile', {
        headers: {
          Authorization: `Bearer ${issueTokenRes?.access_token}`
        }
      })
      const lineProfileRes = res2?.data
      setLineProfile(lineProfileRes)

      router.push('/')
      setCode('')

    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setOpen(error.response.data.error_description)
      }
      router.push('/')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const lineLogin = () => {
    setLoading(true)
    router.replace(url)
  }

  useEffect(() => () => setLoading(false), [])

  const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen('');
  };
  const action = (
    <Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <>
      <Snackbar
        open={!!open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Note archived"
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {open}
        </Alert>
      </Snackbar>
      <Container sx={{ py: 10, textAlign: 'center' }}>
        {!code && (
          <LoadingButton
            loading={loading}
            loadingIndicator="Loading…"
            variant="contained"
            color="success"
            onClick={lineLogin}
          >
            LINE LOGIN
          </LoadingButton>
        )}
        {code && (
          <Box mt={3}>
            <Typography variant="h3">
              Callback Code:
            </Typography>
            {' '}
            <Typography variant="h2">
              {code}
            </Typography>
            <Box mt={3}>
              <LoadingButton
                loading={loading}
                loadingIndicator="Loading…"
                onClick={lineIssueToken}
                variant="contained">
                issue line access token
              </LoadingButton>
            </Box>
          </Box>
        )}
        {!!issueToken?.access_token && (
          <>
            <Box mt={2}>
              <Typography variant="h4">
                ISSUE TOKEN
              </Typography>
              <Typography sx={{
                overflow: 'hidden',
                wordWrap: 'break-word',
              }}>
                access_token: {issueToken?.access_token}
              </Typography>
              <Typography>
                expires_in: {issueToken?.expires_in}
              </Typography>
              <Typography sx={{
                overflow: 'hidden',
                wordWrap: 'break-word',
              }}>
                id_token: {issueToken?.id_token}
              </Typography>
              <Typography>
                refresh_token: {issueToken?.refresh_token}
              </Typography>
              <Typography>
                scope: {issueToken?.scope}
              </Typography>
              <Typography>
                token_type: {issueToken?.token_type}
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="h4">
                LINE PROFILE
              </Typography>
              <Typography>
                displayName: {lineProfile?.displayName}
              </Typography>
              <Box>
                <Typography sx={{
                overflow: 'hidden',
                wordWrap: 'break-word',
              }}>
                  pictureUrl: {lineProfile?.pictureUrl}
                </Typography>
                <Image
                  alt="line-profile"
                  src={lineProfile?.pictureUrl as string}
                  width={200}
                  height={200}
                />
              </Box>
              <Typography>
                statusMessage: {lineProfile?.statusMessage}
              </Typography>
              <Typography>
                userId: {lineProfile?.userId}
              </Typography>
            </Box>
          </>
        )}
      </Container>
    </>
  )
}

LineLogin.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      {page}
    </>
  )
}
